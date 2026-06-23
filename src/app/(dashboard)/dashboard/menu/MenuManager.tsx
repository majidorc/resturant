"use client";

import { useActionState, useState, useTransition } from "react";
import {
  createMenu,
  createMenuItem,
  toggleMenuActive,
  updateMenuItem,
} from "@/lib/actions/menu";
import type { ActionState } from "@/lib/actions/settings";
import { useDictionary } from "@/components/LocaleProvider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { FormAlert } from "@/components/ui/form-alert";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { formatMenuPrice, getMenuLanguageLabel, type MenuLanguage } from "@/lib/locale";
import { useLocale } from "@/components/LocaleProvider";
import {
  formatTranslationPreview,
  parseTranslationMap,
} from "@/lib/translations";
import type { JsonTranslationField } from "@/types/translations";
import { MultiImageDropzone } from "@/components/upload/MultiImageDropzone";

type MenuItemData = {
  id: string;
  name: JsonTranslationField;
  description: JsonTranslationField;
  price: number;
  images: string[];
  isAvailable: boolean;
};

type MenuData = {
  id: string;
  name: JsonTranslationField;
  isActive: boolean;
  items: MenuItemData[];
};

type MenuManagerProps = {
  menus: MenuData[];
  currency: string;
  languages: MenuLanguage[];
};

const initialState: ActionState = {};

function TranslationInputs({
  languages,
  prefix,
  values,
  multiline = false,
}: {
  languages: MenuLanguage[];
  prefix: "name" | "description";
  values?: JsonTranslationField;
  multiline?: boolean;
}) {
  const parsed = parseTranslationMap(values);

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {languages.map((language) => {
        const fieldName = `${prefix}_${language}`;
        const label = `${prefix === "name" ? "Name" : "Description"} (${getMenuLanguageLabel(language)})`;
        const defaultValue = parsed[language] ?? "";

        if (multiline) {
          return (
            <Textarea
              defaultValue={defaultValue}
              key={fieldName}
              name={fieldName}
              placeholder={label}
              rows={2}
            />
          );
        }

        return (
          <Input
            defaultValue={defaultValue}
            key={fieldName}
            name={fieldName}
            placeholder={label}
            required
          />
        );
      })}
    </div>
  );
}

function DishImagesField({ initialImages }: { initialImages?: string[] }) {
  const dict = useDictionary();
  const t = dict.menuManager;
  const [images, setImages] = useState(initialImages ?? []);

  return (
    <>
      <MultiImageDropzone
        dragLabel={t.dishImagesDrag}
        hint={t.dishImagesHint}
        label={t.dishImages}
        maxReachedLabel={t.dishImagesMax}
        onChange={setImages}
        removeLabel={t.dishImagesRemove}
        uploadingLabel={t.dishImagesUploading}
        value={images}
      />
      <input name="images" type="hidden" value={JSON.stringify(images)} />
    </>
  );
}

export function MenuManager({ menus, currency, languages }: MenuManagerProps) {
  const dict = useDictionary();
  const t = dict.menuManager;
  const c = dict.common;
  const { locale } = useLocale();

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
              <h2 className="text-lg font-semibold text-slate-900">{t.categoriesTitle}</h2>
              <p className="text-sm text-slate-500">{t.categoriesSubtitle}</p>
            </div>
            <Button onClick={() => setShowNewMenu((value) => !value)} type="button" variant="secondary">
              {showNewMenu ? c.cancel : t.addCategory}
            </Button>
          </div>

          {showNewMenu && (
            <form action={createMenuAction} className="mt-5 space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <TranslationInputs languages={languages} prefix="name" />
              <Button disabled={creatingMenu} type="submit">
                {creatingMenu ? c.saving : c.create}
              </Button>
            </form>
          )}

          <div className="mt-3">
            <FormAlert message={menuState.error} />
            <FormAlert message={menuState.success ? t.categorySaved : null} variant="success" />
          </div>
        </CardBody>
      </Card>

      {menus.length === 0 ? (
        <Card>
          <CardBody className="py-12 text-center text-sm text-slate-500">{t.noCategories}</CardBody>
        </Card>
      ) : (
        menus.map((menu) => (
          <MenuSection
            currency={currency}
            expandedItemId={expandedItemId}
            key={menu.id}
            languages={languages}
            locale={locale}
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
  currency,
  locale,
  languages,
}: {
  menu: MenuData;
  expandedItemId: string | null;
  setExpandedItemId: (id: string | null) => void;
  onToggleActive: (menuId: string, isActive: boolean) => void;
  pendingMenuId: boolean;
  currency: string;
  locale: string;
  languages: MenuLanguage[];
}) {
  const dict = useDictionary();
  const t = dict.menuManager;
  const c = dict.common;

  const [itemState, createItemAction, creatingItem] = useActionState(createMenuItem, initialState);
  const [showAddItem, setShowAddItem] = useState(false);

  return (
    <Card hover>
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">
              {formatTranslationPreview(menu.name, languages)}
            </h3>
            <p className="text-xs text-slate-500">
              {menu.items.length} {c.items}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={menu.isActive ? "success" : "warning"}>
              {menu.isActive ? c.active : c.hidden}
            </Badge>
            <Button
              disabled={pendingMenuId}
              onClick={() => onToggleActive(menu.id, !menu.isActive)}
              size="sm"
              type="button"
              variant="secondary"
            >
              {menu.isActive ? t.hide : t.show}
            </Button>
            <Button onClick={() => setShowAddItem((value) => !value)} size="sm" type="button">
              {showAddItem ? c.cancel : t.addItem}
            </Button>
          </div>
        </div>
      </CardHeader>

      {showAddItem && (
        <div className="border-b border-slate-200 bg-slate-50 px-5 py-5">
          <form action={createItemAction} className="space-y-3">
            <input name="menuId" type="hidden" value={menu.id} />
            <TranslationInputs languages={languages} prefix="name" />
            <Input min="0.01" name="price" placeholder={t.price} required step="0.01" type="number" />
            <DishImagesField />
            <TranslationInputs languages={languages} multiline prefix="description" />
            <Button disabled={creatingItem} type="submit">
              {creatingItem ? t.adding : t.addItem}
            </Button>
            <FormAlert message={itemState.error} />
          </form>
        </div>
      )}

      {menu.items.length === 0 ? (
        <CardBody>
          <p className="text-sm text-slate-500">{dict.publicMenu.noItemsCategory}</p>
        </CardBody>
      ) : (
        <ul className="divide-y divide-slate-100">
          {menu.items.map((item) => (
            <li className="px-5 py-4 transition-all duration-200 hover:bg-slate-50" key={item.id}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium text-slate-900">
                      {formatTranslationPreview(item.name, languages)}
                    </p>
                    {!item.isAvailable && <Badge variant="warning">{c.unavailable}</Badge>}
                  </div>
                  {formatTranslationPreview(item.description, languages) && (
                    <p className="mt-1 text-sm text-slate-500">
                      {formatTranslationPreview(item.description, languages)}
                    </p>
                  )}
                  <p className="mt-2 text-sm font-semibold tabular-nums text-slate-900">
                    {formatMenuPrice(item.price, currency, locale)}
                  </p>
                </div>
                <Button
                  onClick={() => setExpandedItemId(expandedItemId === item.id ? null : item.id)}
                  size="sm"
                  type="button"
                  variant="secondary"
                >
                  {expandedItemId === item.id ? c.close : c.edit}
                </Button>
              </div>

              {expandedItemId === item.id && (
                <EditItemForm item={item} languages={languages} />
              )}
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}

function EditItemForm({
  item,
  languages,
}: {
  item: MenuItemData;
  languages: MenuLanguage[];
}) {
  const dict = useDictionary();
  const t = dict.menuManager;
  const c = dict.common;
  const [state, formAction, pending] = useActionState(updateMenuItem, initialState);

  return (
    <form
      action={formAction}
      className="mt-4 space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 transition-all duration-200"
    >
      <input name="itemId" type="hidden" value={item.id} />
      <TranslationInputs languages={languages} prefix="name" values={item.name} />
      <Input
        defaultValue={item.price}
        min="0.01"
        name="price"
        placeholder={t.price}
        required
        step="0.01"
        type="number"
      />
      <DishImagesField initialImages={item.images} />
      <TranslationInputs
        languages={languages}
        multiline
        prefix="description"
        values={item.description}
      />
      <label className="flex items-center gap-2 text-sm text-slate-700">
        <input
          className="h-4 w-4 rounded border-slate-300"
          defaultChecked={item.isAvailable}
          name="isAvailable"
          type="checkbox"
          value="true"
        />
        {t.availableOnMenu}
      </label>
      <Button disabled={pending} type="submit">
        {pending ? c.saving : c.saveChanges}
      </Button>
      <FormAlert message={state.error} />
      <FormAlert message={state.success ? t.itemUpdated : null} variant="success" />
    </form>
  );
}
