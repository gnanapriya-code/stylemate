import React from "react";
// use relative imports because @ alias isn't resolving
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { ChevronRight, Heart } from "lucide-react";

export default function SingleOutfitDisplay({ outfit, wardrobeItems = [], onToggleFavorite, onNext }) {
  const find = (id) => wardrobeItems.find(w => w.id === id);

  const top = outfit?.top_item_id ? find(outfit.top_item_id) : null;
  const bottom = outfit?.bottom_item_id ? find(outfit.bottom_item_id) : null;
  const dress = outfit?.dress_item_id ? find(outfit.dress_item_id) : null;

  return (
    <Card className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">{outfit?.outfit_name}</h2>
        <Button onClick={onToggleFavorite} className="bg-pink-500 text-white">
          <Heart className="mr-2" /> Favorite
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {dress && (
          <div>
            <img src={dress.image_url} alt={dress.item_name} className="w-full h-64 object-cover rounded" />
            <p className="text-center mt-2">{dress.item_name}</p>
          </div>
        )}
        {top && (
          <div>
            <img src={top.image_url} alt={top.item_name} className="w-full h-64 object-cover rounded" />
            <p className="text-center mt-2">{top.item_name}</p>
          </div>
        )}
        {bottom && (
          <div>
            <img src={bottom.image_url} alt={bottom.item_name} className="w-full h-64 object-cover rounded" />
            <p className="text-center mt-2">{bottom.item_name}</p>
          </div>
        )}
      </div>

      {Array.isArray(outfit?.accessories) && outfit.accessories.length > 0 && (
        <div className="space-y-2">
          <h3 className="font-semibold">Accessories</h3>
          {outfit.accessories.map((a, i) => (
            <a key={i} href={a.buy_link} target="_blank" rel="noreferrer" className="block border p-3 rounded hover:bg-pink-50">
              <strong>{a.name}</strong> — {a.description}
            </a>
          ))}
        </div>
      )}

      <Card className="p-3 bg-gray-50">
        <p>{outfit?.ai_reasoning}</p>
      </Card>

      <Button onClick={onNext} className="w-full bg-purple-500 text-white">
        Next <ChevronRight className="ml-2" />
      </Button>
    </Card>
  );
}
