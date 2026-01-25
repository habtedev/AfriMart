"use client";
import React, { useState, useEffect } from "react";


const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8500/api';

// Fetch all carousel images
const fetchCarousels = async () => {
  const res = await fetch(`${API_BASE}/carousel`);
  const data = await res.json();
  return data.images || [];
};

// Add a new carousel image (with file upload or URL)
const createCarousel = async (data: any) => {
  const formData = new FormData();
  if (data.file) {
    formData.append('image', data.file);
  } else {
    formData.append('src', data.image);
  }
  formData.append('alt', data.title || '');
  await fetch(`${API_BASE}/carousel`, {
    method: 'POST',
    body: formData,
  });
};

// Update a carousel image
const updateCarousel = async (id: string, data: any) => {
  await fetch(`${API_BASE}/carousel/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ src: data.image, alt: data.title }),
  });
};

// Delete a carousel image
const deleteCarousel = async (id: string) => {
  await fetch(`${API_BASE}/carousel/${id}`, { method: 'DELETE' });
};


export default function CarouselAdminPage() {
  const [carousels, setCarousels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ image: '', title: '', file: null as File | null });
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    fetchCarousels().then((data) => {
      setCarousels(data);
      setLoading(false);
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    if (editingId) {
      await updateCarousel(editingId, form);
    } else {
      await createCarousel(form);
    }
    setEditingId(null);
    setForm({ image: '', title: '', file: null });
    setCarousels(await fetchCarousels());
    setLoading(false);
  };

  const handleEdit = (carousel: any) => {
    setEditingId(carousel._id);
    setForm({ image: carousel.src, title: carousel.alt, file: null });
  };

  const handleDelete = async (id: string) => {
    setLoading(true);
    await deleteCarousel(id);
    setCarousels(await fetchCarousels());
    setLoading(false);
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Carousel Admin</h2>
      <form onSubmit={handleSubmit} className="mb-6 space-y-2">
        <input
          className="border p-2 w-full"
          placeholder="Image URL (or upload below)"
          value={form.image}
          onChange={(e) => setForm({ ...form, image: e.target.value })}
          disabled={!!form.file}
        />
        <input
          type="file"
          accept="image/*"
          className="border p-2 w-full"
          onChange={e => setForm({ ...form, file: e.target.files ? e.target.files[0] : null, image: '' })}
        />
        <input
          className="border p-2 w-full"
          placeholder="Alt text / Title"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          required
        />
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
          {editingId ? "Update" : "Add"} Carousel
        </button>
        {editingId && (
          <button type="button" onClick={() => { setEditingId(null); setForm({ image: '', title: '', file: null }); }} className="ml-2 px-4 py-2 border rounded">
            Cancel
          </button>
        )}
      </form>
      {loading ? (
        <div>Loading...</div>
      ) : (
        <table className="w-full border">
          <thead>
            <tr>
              <th className="border p-2">Image</th>
              <th className="border p-2">Title</th>
              <th className="border p-2">Link</th>
              <th className="border p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {carousels.map((carousel) => (
              <tr key={carousel._id}>
                <td className="border p-2"><img src={carousel.src} alt={carousel.alt} className="h-12" /></td>
                <td className="border p-2">{carousel.alt}</td>
                <td className="border p-2">
                  <button onClick={() => handleEdit(carousel)} className="text-blue-600 mr-2">Edit</button>
                  <button onClick={() => handleDelete(carousel._id)} className="text-red-600">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
