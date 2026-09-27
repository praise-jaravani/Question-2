/* eslint-disable no-undef */
import chai from 'chai';
import chaiHttp from 'chai-http';
import app from '../app.js';
import User from '../models/User.js';
import Post from '../models/Post.js';
import { exec } from 'child_process';

chai.use(chaiHttp);
const { expect } = chai;

const seedDatabase = () =>
  new Promise((resolve, reject) => {
    exec('node utils/seed.js', (error, stdout, stderr) => {
      if (error) {
        reject(error);
      } else {
        resolve(stdout);
      }
    });
  });

const getUserIdByEmail = async (email) => {
  const user = await User.findByEmail(email);
  return user._id.toString();
};

describe('Post Creation Testing', () => {
  it('should create a post with expected response structure and values', async () => {
    await seedDatabase();
    const userId = await getUserIdByEmail('john@example.com');
    const postData = {
      title: 'Test Blog Post',
      content: 'This is a test blog post content with some sample text for testing purposes.',
      excerpt: 'This is a test excerpt',
      category: 'Technology',
      tags: ['test', 'blog', 'sample'],
      readTime: 5
    };
    const response = await chai
      .request(app)
      .post('/api/posts')
      .set('x-user-id', userId)
      .send(postData);

    expect(response).to.have.status(201);
    expect(response.body).to.have.property('message', 'Post created successfully');
    expect(response.body).to.have.property('post');
    const post = response.body.post;
    expect(post).to.have.property('title', postData.title);
    expect(post).to.have.property('content', postData.content);
    expect(post).to.have.property('excerpt', postData.excerpt);
    expect(post).to.have.property('category', postData.category);
    expect(post.tags).to.deep.equal(postData.tags);
    expect(post).to.have.property('readTime', postData.readTime);
    expect(post).to.have.property('published', true);
    expect(post).to.have.property('author');
    expect(post.author).to.have.property('_id', userId);
    expect(post.author).to.have.property('name', 'John Doe');
    expect(post.author).to.have.property('email', 'john@example.com');
    expect(post.author).to.have.property('bio');
  }).timeout(10000);

  it('should default the excerpt to the first 150 characters of the content when no excerpt is provided', async () => {
    await seedDatabase();
    const userId = await getUserIdByEmail('john@example.com');
    const postData = {
      title: 'Post Without An Excerpt',
      content:
        'Excerpts summarise a post for list pages. When an author does not provide one, the platform is expected to generate it automatically from the beginning of the content so that post cards never render empty. This sentence pads the content well past the boundary.',
      category: 'Technology',
      tags: ['testing'],
      readTime: 2
    };
    const expectedExcerpt = postData.content.substring(0, 150);

    const response = await chai
      .request(app)
      .post('/api/posts')
      .set('x-user-id', userId)
      .send(postData);

    expect(response).to.have.status(201);
    expect(response.body).to.have.property('message', 'Post created successfully');
    expect(response.body).to.have.property('post');
    expect(response.body.post).to.have.property('excerpt', expectedExcerpt);

    const savedPost = await Post.findById(response.body.post._id);
    expect(savedPost).to.not.be.null;
    expect(savedPost.excerpt).to.equal(expectedExcerpt);
  }).timeout(10000);
});

describe('Post Browsing Testing', () => {
  it('should return only the logged-in user\'s posts on My Posts, including a newly created one', async () => {
    await seedDatabase();
    const userId = await getUserIdByEmail('john@example.com');
    const postData = {
      title: 'My Newest Post',
      content: 'A fresh post that should appear in My Posts immediately after creation.',
      excerpt: 'A fresh post',
      category: 'Technology',
      tags: ['new'],
      readTime: 1
    };
    const createResponse = await chai
      .request(app)
      .post('/api/posts')
      .set('x-user-id', userId)
      .send(postData);
    expect(createResponse).to.have.status(201);

    const response = await chai
      .request(app)
      .get('/api/posts/my-posts')
      .set('x-user-id', userId);

    expect(response).to.have.status(200);
    expect(response.body).to.have.property('posts');
    expect(response.body.posts).to.be.an('array');
    expect(response.body.posts).to.have.lengthOf(4);
    response.body.posts.forEach((post) => {
      expect(post.author).to.have.property('_id', userId);
      expect(post.author).to.have.property('name', 'John Doe');
    });
    const created = response.body.posts.find((p) => p.title === 'My Newest Post');
    expect(created).to.not.be.undefined;
  }).timeout(10000);

  it('should exclude unpublished drafts from the public post list', async () => {
    await seedDatabase();

    const response = await chai.request(app).get('/api/posts');

    expect(response).to.have.status(200);
    expect(response.body).to.have.property('posts');
    expect(response.body.posts).to.be.an('array');
    expect(response.body.posts).to.have.lengthOf(8);
    response.body.posts.forEach((post) => {
      expect(post).to.have.property('published', true);
    });
    const draft = response.body.posts.find(
      (p) => p.title === 'Digital Minimalism: Reclaiming Your Attention'
    );
    expect(draft).to.be.undefined;
  }).timeout(10000);

  it('should filter the public post list by category', async () => {
    await seedDatabase();

    const response = await chai.request(app).get('/api/posts').query({ category: 'Travel' });

    expect(response).to.have.status(200);
    expect(response.body).to.have.property('posts');
    expect(response.body.posts).to.be.an('array');
    expect(response.body.posts).to.have.lengthOf(2);
    response.body.posts.forEach((post) => {
      expect(post).to.have.property('category', 'Travel');
      expect(post.author).to.have.property('name', 'Sarah Johnson');
    });
  }).timeout(10000);

  it('should search post titles case-insensitively', async () => {
    await seedDatabase();

    const response = await chai.request(app).get('/api/posts').query({ search: 'react' });

    expect(response).to.have.status(200);
    expect(response.body).to.have.property('posts');
    expect(response.body.posts).to.be.an('array');
    expect(response.body.posts).to.have.lengthOf(1);
    expect(response.body.posts[0]).to.have.property('title', 'Getting Started with React Hooks');
  }).timeout(10000);

  it('should not include the author\'s password in a single post response', async () => {
    await seedDatabase();
    const post = await Post.findOne({ title: 'Getting Started with React Hooks' });

    const response = await chai.request(app).get(`/api/posts/${post._id.toString()}`);

    expect(response).to.have.status(200);
    expect(response.body).to.have.property('post');
    expect(response.body.post).to.have.property('author');
    expect(response.body.post.author).to.have.property('name', 'John Doe');
    expect(response.body.post.author).to.have.property('email', 'john@example.com');
    expect(response.body.post.author).to.have.property('bio');
    expect(response.body.post.author).to.not.have.property('password');
  }).timeout(10000);
});

describe('Post Update Testing', () => {
  it('should let the author update a post and save the changes', async () => {
    await seedDatabase();
    const userId = await getUserIdByEmail('john@example.com');
    const post = await Post.findOne({ title: 'Getting Started with React Hooks' });
    const updates = {
      title: 'Getting Started with React Hooks (2024 Edition)',
      excerpt: 'A refreshed introduction to React Hooks.'
    };

    const response = await chai
      .request(app)
      .put(`/api/posts/${post._id.toString()}`)
      .set('x-user-id', userId)
      .send(updates);

    expect(response).to.have.status(200);
    expect(response.body).to.have.property('message', 'Post updated successfully');
    expect(response.body).to.have.property('post');
    expect(response.body.post).to.have.property('title', updates.title);
    expect(response.body.post).to.have.property('excerpt', updates.excerpt);

    const savedPost = await Post.findById(post._id);
    expect(savedPost.title).to.equal(updates.title);
    expect(savedPost.excerpt).to.equal(updates.excerpt);

    const detailResponse = await chai.request(app).get(`/api/posts/${post._id.toString()}`);
    expect(detailResponse).to.have.status(200);
    expect(detailResponse.body.post).to.have.property('title', updates.title);
  }).timeout(10000);

  it('should return 403 when a user tries to update someone else\'s post', async () => {
    await seedDatabase();
    const sarahId = await getUserIdByEmail('sarah@example.com');
    const post = await Post.findOne({ title: 'Getting Started with React Hooks' });

    const response = await chai
      .request(app)
      .put(`/api/posts/${post._id.toString()}`)
      .set('x-user-id', sarahId)
      .send({ title: 'Hijacked Title' });

    expect(response).to.have.status(403);
    expect(response.body).to.have.property('message', 'Not authorized to update this post');

    const savedPost = await Post.findById(post._id);
    expect(savedPost.title).to.equal('Getting Started with React Hooks');
  }).timeout(10000);
});

describe('Post Deletion and Auth Testing', () => {
  it('should delete exactly the requested post', async () => {
    await seedDatabase();
    const userId = await getUserIdByEmail('john@example.com');
    const post = await Post.findOne({ title: 'Building Scalable Microservices' });

    const response = await chai
      .request(app)
      .delete(`/api/posts/${post._id.toString()}`)
      .set('x-user-id', userId);

    expect(response).to.have.status(200);
    expect(response.body).to.have.property('message', 'Post deleted successfully');

    const deletedPost = await Post.findById(post._id);
    expect(deletedPost).to.be.null;

    const remainingCount = await Post.countDocuments({});
    expect(remainingCount).to.equal(8);

    const otherPost = await Post.findOne({ title: 'Getting Started with React Hooks' });
    expect(otherPost).to.not.be.null;
  }).timeout(10000);

  it('should return 403 when a user tries to delete someone else\'s post', async () => {
    await seedDatabase();
    const sarahId = await getUserIdByEmail('sarah@example.com');
    const post = await Post.findOne({ title: 'Getting Started with React Hooks' });

    const response = await chai
      .request(app)
      .delete(`/api/posts/${post._id.toString()}`)
      .set('x-user-id', sarahId);

    expect(response).to.have.status(403);
    expect(response.body).to.have.property('message', 'Not authorized to delete this post');

    const stillThere = await Post.findById(post._id);
    expect(stillThere).to.not.be.null;
    const count = await Post.countDocuments({});
    expect(count).to.equal(9);
  }).timeout(10000);

  it('should log in successfully without exposing the password', async () => {
    await seedDatabase();

    const response = await chai
      .request(app)
      .post('/api/auth/login')
      .send({ email: 'john@example.com', password: 'password123' });

    expect(response).to.have.status(200);
    expect(response.body).to.have.property('message', 'Login successful');
    expect(response.body).to.have.property('user');
    expect(response.body.user).to.have.property('name', 'John Doe');
    expect(response.body.user).to.have.property('email', 'john@example.com');
    expect(response.body.user).to.not.have.property('password');
  }).timeout(10000);
});

after(async function () {
  this.timeout(10000);
  await seedDatabase();
});
