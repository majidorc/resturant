"use client";

import { useActionState, useState, useTransition } from "react";
import {
  createMenu,
  createMenuItem,
  toggleMenuActive,
  updateMenuItem,
} from "@/lib/actions/menu";
import type { ActionState } from "@/lib/actions/settings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type MenuItemData = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  imageUrl: string | null;
  isAvailable: boolean;
};

type MenuData = {
  id: string;
  name: string;
  isActive: boolean;
  items: MenuItemData[];
};

type MenuManagerProps = {
  menus: MenuData[];
};

const initialState: ActionState = {};

function formatPrice(price: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(price);
}

export function MenuManager({ menus }: MenuManagerProps) {
  const [menuState, createMenuAction, creatingMenu] = useActionState(createMenu, initialState);
  const [showNewMenu, setShowNewMenu] = useState(false);
  const [expandedItemId, setExpandedItemId] = useState<string | null>(null);
  const [pendingMenuId, startToggle] = useTransition();

  return (
    <div className="space-y-8">
      <section className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-zinc-900">Menu Categories</h2>
            <p className="text-sm text-zinc-600">Organize items into sections like Main Course or Beverages.</p>
          </div>
          <Button onClick={() => setShowNewMenu((value) => !value)} type="button" variant="secondary">
            {showNewMenu ? "Cancel" : "Add Category"}
          </Button>
        </div>

        {showNewMenu && (
          <form action={createMenuAction} className="mt-4 flex flex-col gap-3 sm:flex-row">
            <Input name="name" placeholder="e.g. Main Course" required />
            <Button disabled={creatingMenu} type="submit">
              {creatingMenu ? "Saving…" : "Create"}
            </Button>
          </form>
        )}

        {menuState.error && <p className="mt-3 text-sm text-red-600">{menuState.error}</p>}
        {menuState.success && <p className="mt-3 text-sm text-green-700">Menu category saved.</p>}
      </section>

      {menus.length === 0 ? (
        <p className="rounded-xl border border-dashed border-zinc-300 bg-white p-8 text-center text-sm text-zinc-500">
          No menus yet. Add your first category above.
        </p>
      ) : (
        menus.map((menu) => (
          <MenuSection
            expandedItemId={expandedItemId}
            key={menu.id}
            menu={menu}
            onToggleActive={(menuId, isActive) => {
              startToggle(async () => {
                await toggleMenuActive(menuId, isActive);
              });
            }}
            pendingMenuId={pendingMenuId}
            setExpandedItemId={setExpandedItemId}
          />
        ))
      )}
    </div>
  );
}

function MenuSection({
  menu,
  expandedItemId,
  setExpandedItemId,
  onToggleActive,
  pendingMenuId,
}: {
  menu: MenuData;
  expandedItemId: string | null;
  setExpandedItemId: (id: string | null) => void;
  onToggleActive: (menuId: string, isActive: boolean) => void;
  pendingMenuId: boolean;
}) {
  const [itemState, createItemAction, creatingItem] = useActionState(createMenuItem, initialState);
  const [showAddItem, setShowAddItem] = useState(false);

  return (
    <section className="rounded-xl border border-zinc-200 bg-white shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-200 px-5 py-4">
        <div>
          <h3 className="text-lg font-semibold text-zinc-900">{menu.name}</h3>
          <p className="text-xs text-zinc-500">{menu.items.length} items</p>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`rounded-full px-2.5 py-1 text-xs font-medium ${
              menu.isActive ? "bg-green-100 text-green-800" : "bg-zinc-100 text-zinc-600"
            }`}
          >
            {menu.isActive ? "Active" : "Hidden"}
          </span>
          <Button
            disabled={pendingMenuId}
            onClick={() => onToggleActive(menu.id, !menu.isActive)}
            type="button"
            variant="secondary"
          >
            {menu.isActive ? "Hide" : "Show"}
          </Button>
          <Button onClick={() => setShowAddItem((value) => !value)} type="button">
            {showAddItem ? "Cancel" : "Add Item"}
          </Button>
        </div>
      </div>

      {showAddItem && (
        <form action={createItemAction} className="space-y-3 border-b border-zinc-200 bg-zinc-50 p-5">
          <input name="menuId" type="hidden" value={menu.id} />
          <div className="grid gap-3 sm:grid-cols-2">
            <Input name="name" placeholder="Item name" required />
            <Input min="0.01" name="price" placeholder="Price" required step="0.01" type="number" />
          </div>
          <Input name="description" placeholder="Description (optional)" />
          <Input name="imageUrl" placeholder="Image URL (optional)" type="url" />
          <Button disabled={creatingItem} type="submit">
            {creatingItem ? "Adding…" : "Add Item"}
          </Button>
          {itemState.error && <p className="text-sm text-red-600">{itemState.error}</p>}
        </form>
      )}

      {menu.items.length === 0 ? (
        <p className="px-5 py-6 text-sm text-zinc-500">No items in this category.</p>
      ) : (
        <ul className="divide-y divide-zinc-200">
          {menu.items.map((item) => (
            <li className="px-5 py-4" key={item.id}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-medium text-zinc-900">
                    {item.name}{" "}
                    {!item.isAvailable && (
                      <span className="text-xs font-normal text-amber-600">(Unavailable)</span>
                    )}
                  </p>
                  {item.description && (
                    <p className="mt-0.5 text-sm text-zinc-600">{item.description}</p>
                  )}
                  <p className="mt-1 text-sm font-medium text-zinc-900">{formatPrice(item.price)}</p>
                </div>
                <Button
                  onClick={() =>
                    setExpandedItemId(expandedItemId === item.id ? null : item.id)
                  }
                  type="button"
                  variant="secondary"
                >
                  {expandedItemId === item.id ? "Close" : "Edit"}
                </Button>
              </div>

              {expandedItemId === item.id && <EditItemForm item={item} />}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function EditItemForm({ item }: { item: MenuItemData }) {
  const [state, formAction, pending] = useActionState(updateMenuItem, initialState);

  return (
    <form action={formAction} className="mt-4 space-y-3 rounded-lg border border-zinc-200 bg-zinc-50 p-4">
      <input name="itemId" type="hidden" value={item.id} />
      <div className="grid gap-3 sm:grid-cols-2">
        <Input defaultValue={item.name} name="name" placeholder="Item name" required />
        <Input
          defaultValue={item.price}
          min="0.01"
          name="price"
          placeholder="Price"
          required
          step="0.01"
          type="number"
        />
      </div>
      <Input defaultValue={item.description ?? ""} name="description" placeholder="Description" />
      <Input defaultValue={item.imageUrl ?? ""} name="imageUrl" placeholder="Image URL" type="url" />
      <label className="flex items-center gap-2 text-sm text-zinc-700">
        <input defaultChecked={item.isAvailable} name="isAvailable" type="checkbox" value="true" />
        Available on menu
      </label>
      <Button disabled={pending} type="submit">
        {pending ? "Saving…" : "Save Changes"}
      </Button>
      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
      {state.success && <p className="text-sm text-green-700">Item updated.</p>}
    </form>
  );
}
