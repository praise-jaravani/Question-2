.DEFAULT_GOAL := help
.PHONY: help setup start backend frontend test test-one seed save reset

help:
	@echo "Practice lab commands:"
	@echo "  make setup              install everything and pre-download the in-memory MongoDB (first time only)"
	@echo "  make start              run backend + frontend together (Ctrl+C to stop)"
	@echo "  make backend            run only the backend with its console logs (best for debugging)"
	@echo "  make frontend           run only the frontend"
	@echo "  make test               run the full test suite (shows your score at the end)"
	@echo "  make test-one t=\"name\"  run only the tests whose name contains the fragment"
	@echo "  make seed               reseed the database"
	@echo "  make save               commit your current progress, so you can experiment safely"
	@echo "  make reset              restore the original starting code (progress commits and edits discarded; node_modules kept)"

setup:
	npm run setup

start:
	npm start

backend:
	cd backend && npm start

frontend:
	cd frontend && npm start

test:
	npm test

test-one:
	npm run test:one -- "$(t)"

seed:
	npm run seed

save:
	git add -A && git commit -m "practice progress" || echo "Nothing new to save."

reset:
	git reset --hard start
	git clean -fdq
	@echo "Codebase restored to the original starting state."
