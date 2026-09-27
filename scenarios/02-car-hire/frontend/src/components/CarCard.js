import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Calendar } from 'lucide-react';

const CarCard = ({ car }) => {
  return (
    <Link
      to={`/car/${car._id}`}
      className="block rounded-xl border border-zinc-800 bg-zinc-950 p-5 transition-colors hover:border-purple-700"
    >
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-purple-950 px-3 py-1 text-xs font-medium text-purple-300">
            {car.year}
          </span>
          {car.available === false && (
            <span className="rounded-full bg-red-950 px-3 py-1 text-xs font-medium text-red-300">
              Unavailable
            </span>
          )}
        </div>
        <span className="text-sm font-semibold text-purple-300">
          R{car.pricePerDay}
          <span className="text-xs font-normal text-zinc-500">/day</span>
        </span>
      </div>
      <h2 className="mb-1 text-lg font-semibold text-zinc-100">
        {car.make} {car.model}
      </h2>
      <p className="mb-4 line-clamp-2 text-sm text-zinc-400">{car.description}</p>
      <div className="flex items-center justify-between text-xs text-zinc-500">
        <span className="flex items-center gap-1">
          <MapPin size={12} />
          {car.location}
        </span>
        <span className="flex items-center gap-1">
          <Calendar size={12} />
          {car.owner?.name || 'Unknown owner'}
        </span>
      </div>
    </Link>
  );
};

export default CarCard;
