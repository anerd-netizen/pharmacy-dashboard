'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

type InventoryItem = {
  id: string
  name: string
  stock: number
}

export default function Home() {
  const [inventory, setInventory] = useState<InventoryItem[]>([])
  const [user, setUser] = useState<any>(null)

  // ✅ NEW STATES (must be here at top)
  const [newName, setNewName] = useState('')
  const [newStock, setNewStock] = useState(0)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user)
    })

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null)
      }
    )

    return () => {
      listener.subscription.unsubscribe()
    }
  }, [])

  const fetchInventory = async () => {
    const { data } = await supabase
      .from('inventory')
      .select('*')
      .order('name')

    if (data) setInventory(data)
  }

  useEffect(() => {
    fetchInventory()

    const channel = supabase
      .channel('inventory-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'inventory',
        },
        (payload) => {
          if (payload.eventType === 'UPDATE') {
            const updatedItem = payload.new as InventoryItem

            setInventory((prev) =>
              prev.map((item) =>
                item.id === updatedItem.id ? updatedItem : item
              )
            )
          }

          if (payload.eventType === 'INSERT') {
            const newItem = payload.new as InventoryItem
            setInventory((prev) => [...prev, newItem])
          }

          if (payload.eventType === 'DELETE') {
            setInventory((prev) =>
              prev.filter((item) => item.id !== payload.old.id)
            )
          }
        }
      )
      .subscribe((status) => {
        console.log('Realtime status:', status)
      })

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const updateStock = async (id: string, newStock: number) => {
    await supabase
      .from('inventory')
      .update({ stock: newStock })
      .eq('id', id)
  }

  // ✅ STEP 3 — ADD MEDICINE FUNCTION
  const addMedicine = async () => {
    if (!newName) return alert('Enter medicine name')

    const { error } = await supabase.from('inventory').insert([
      {
        name: newName,
        stock: newStock,
      },
    ])

    if (error) {
      alert(error.message)
    } else {
      setNewName('')
      setNewStock(0)
    }
  }

  const login = async () => {
    const email = prompt('Email:')
    const password = prompt('Password:')
    if (!email || !password) return

    await supabase.auth.signInWithPassword({
      email,
      password,
    })
  }

  const logout = async () => {
    await supabase.auth.signOut()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-800 p-10 text-white">
      <h1 className="text-4xl font-bold mb-2">
        Pharmacy Inventory Dashboard
      </h1>

      {!user ? (
        <button
          onClick={login}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Login
        </button>
      ) : (
        <div className="mb-6">
          <p className="text-gray-300 mb-2">
            Logged in as: {user.email}
          </p>
          <button
            onClick={logout}
            className="bg-red-500 hover:bg-red-600 text-white px-5 py-2 rounded-lg shadow-md transition"
          >
            Logout
          </button>
        </div>
      )}

      {/* ✅ STEP 4 — ADD MEDICINE UI */}
      {user && (
        <div className="mb-6 flex gap-4">
          <input
            type="text"
            placeholder="Medicine name"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className="px-4 py-2 rounded-lg bg-white/20 border border-white/20 backdrop-blur-md text-white placeholder-gray-300"
          />

          <input
            type="number"
            placeholder="Stock"
            value={newStock}
            onChange={(e) => setNewStock(Number(e.target.value))}
            className="px-4 py-2 rounded-lg bg-white/20 border border-white/20 backdrop-blur-md text-white placeholder-gray-300 w-32"
          />

          <button
            onClick={addMedicine}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg shadow-md transition"
          >
            Add
          </button>
        </div>
      )}

      <div className="overflow-hidden rounded-xl shadow-2xl border border-white/10 bg-white/10 backdrop-blur-md">
        <table className="w-full">
          <thead className="bg-black text-white">
            <tr>
              <th className="p-4 text-left">Image</th>
              <th className="p-4 text-left">Medicine</th>
              <th className="p-4 text-left">Stock</th>
              {user && <th className="p-4 text-left">Update</th>}
            </tr>
          </thead>

          <tbody className="bg-transparent">
            {inventory.map((item) => (
              <tr
                key={item.id}
                className="border-t border-white/10 hover:bg-white/10 transition"
              >
                <td className="p-4">
                  <img
                    src={`https://placehold.co/60x60?text=${item.name.charAt(0)}`}
                    alt={item.name}
                    className="rounded-lg"
                  />
                </td>

                <td className="p-4 font-medium">{item.name}</td>

                <td className="p-4">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      item.stock <= 5
                        ? 'bg-red-100 text-red-600'
                        : item.stock <= 15
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-green-100 text-green-700'
                    }`}
                  >
                    {item.stock}
                  </span>
                </td>

                {user && (
                  <td className="p-4 space-x-2">
                    <button
                      onClick={() =>
                        updateStock(item.id, item.stock - 1)
                      }
                      className="bg-gray-500 text-white px-3 py-1 rounded hover:bg-gray-600 transition"
                    >
                      -1
                    </button>
                    <button
                      onClick={() =>
                        updateStock(item.id, item.stock + 1)
                      }
                      className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 transition"
                    >
                      +1
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}