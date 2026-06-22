"use client";

import { useActionState, useState, useTransition } from "react";
import {
  createMenu,
  createMenuItem,
  toggleMenuActive,
  updateMenuItem,
} from "@/lib/actions/menu";
import type { ActionState } from "@/lib/actions/settings";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { FormAlert } from "@/components/ui/form-alert";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

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
    <div className="space-y-6">
      <Card>
        <CardBody>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Menu Categories</h2>
              <p className="text-sm text-slate-500">Organize items into sections like Main Course or Beverages.</p>
            </div>
            <Button onClick={() => setShowNewMenu((value) => !value)} type="button" variant="secondary">
              {showNewMenu ? "Cancel" : "Add Category"}
            </Button>
          </div>

          {showNewMenu && (
            <form action={createMenuAction} className="mt-5 flex flex-col gap-3 rounded-2xl border border-slate-100/80 bg-slate-50 p-4 sm:flex-row">
              <Input name="name" placeholder="e.g. Main Course" required />
              <Button disabled={creatingMenu} type="submit">
                {creatingMenu ? "Saving…" : "Create"}
              </Button>
            </form>
          )}

          <div className="mt-3">
            <FormAlert message={menuState.error} />
            <FormAlert message={menuState.success ? "Menu category saved." : null} variant="success" />
          </div>
        </CardBody>
      </Card>

      {menus.length === 0 ? (
        <Card>
          <CardBody className="py-12 text-center text-sm text-slate-500">
            No menus yet. Add your first category above.
          </CardBody>
        </Card>
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
    <Card hover>
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">{menu.name}</h3>
            <p className="text-xs text-slate-400">{menu.items.length} items</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={menu.isActive ? "success" : "warning"}>
              {menu.isActive ? "Active" : "Hidden"}
            </Badge>
            <Button
              disabled={pendingMenuId}
              onClick={() => onToggleActive(menu.id, !menu.isActive)}
              size="sm"
              type="button"
              variant="secondary"
            >
              {menu.isActive ? "Hide" : "Show"}
            </Button>
            <Button onClick={() => setShowAddItem((value) => !value)} size="sm" type="button">
              {showAddItem ? "Cancel" : "Add Item"}
            </Button>
          </div>
        </div>
      </CardHeader>

      {showAddItem && (
        <div className="border-b border-slate-100/80 bg-slate-50/80 px-5 py-5">
          <form action={createItemAction} className="space-y-3">
            <input name="menuId" type="hidden" value={menu.id} />
            <div className="grid gap-3 sm:grid-cols-2">
              <Input name="name" placeholder="Item name" required />
              <Input min="0.01" name="price" placeholder="Price" required step="0.01" type="number" />
            </div>
            <Textarea name="description" placeholder="Description (optional)" rows={2} />
            <Input name="imageUrl" placeholder="Image URL (optional)" type="url" />
            <Button disabled={creatingItem} type="submit">
              {creatingItem ? "Adding…" : "Add Item"}
            </Button>
            <FormAlert message={itemState.error} />
          </form>
        </div>
      )}

      {menu.items.length === 0 ? (
        <CardBody>
          <p className="text-sm text-slate-500">No items in this category.</p>
        </CardBody>
      ) : (
        <ul className="divide-y divide-slate-100/80">
          {menu.items.map((item) => (
            <li className="px-5 py-4 transition-all duration-200 hover:bg-slate-50/50" key={item.id}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium text-slate-900">{item.name}</p>
                    {!item.isAvailable && <Badge variant="warning">Unavailable</Badge>}
                  </div>
                  {item.description && (
                    <p className="mt-1 text-sm text-slate-500">{item.description}</p>
                  )}
                  <p className="mt-2 text-sm font-semibold tabular-nums text-slate-900">
                    {formatPrice(item.price)}
                  </p>
                </div>
                <Button
                  onClick={() => setExpandedItemId(expandedItemId === item.id ? null : item.id)}
                  size="sm"
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
    </Card>
  );
}

function EditItemForm({ item }: { item: MenuItemData }) {
  const [state, formAction, pending] = useActionState(updateMenuItem, initialState);

  return (
    <form
      action={formAction}
      className="mt-4 space-y-3 rounded-2xl border border-slate-100/80 bg-slate-50 p-4 transition-all duration-200"
    >
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
      <Textarea defaultValue={item.description ?? ""} name="description" placeholder="Description" rows={2} />
      <Input defaultValue={item.imageUrl ?? ""} name="imageUrl" placeholder="Image URL" type="url" />
      <label className="flex items-center gap-2 text-sm text-slate-700">
        <input
          className="h-4 w-4 rounded border-slate-300"
          defaultChecked={item.isAvailable}
          name="isAvailable"
          type="checkbox"
          value="true"
        />
        Available on menu
      </label>
      <Button disabled={pending} type="submit">
        {pending ? "Saving…" : "Save Changes"}
      </Button>
      <FormAlert message={state.error} />
      <FormAlert message={state.success ? "Item updated." : null} variant="success" />
    </form>
  );
}
