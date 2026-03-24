import React from "react";
export default function WardrobeGrid({items, onDelete}){ return <div className="grid gap-4">{items.map(i=> <div key={i.id}>{i.item_name}</div>)}</div>; }
