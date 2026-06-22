type MenuItemData = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  imageUrl: string | null;
};

type MenuData = {
  id: string;
  name: string;
  items: MenuItemData[];
};

type MenuListProps = {
  menus: MenuData[];
};

function formatPrice(price: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(price);
}

export function MenuList({ menus }: MenuListProps) {
  if (menus.length === 0) {
    return (
      <p className="px-4 py-12 text-center text-sm text-zinc-500">No menu items yet.</p>
    );
  }

  return (
    <div className="space-y-8 px-4 py-6">
      {menus.map((menu) => (
        <section key={menu.id}>
          <h2 className="mb-4 text-lg font-semibold">{menu.name}</h2>
          <ul className="space-y-4">
            {menu.items.map((item) => (
              <li
                className="flex items-start justify-between gap-4 border-b border-zinc-200 pb-4 last:border-0"
                key={item.id}
              >
                <div className="min-w-0 flex-1">
                  <p className="font-medium">{item.name}</p>
                  {item.description && (
                    <p className="mt-0.5 text-sm text-zinc-600">{item.description}</p>
                  )}
                </div>
                <span className="shrink-0 text-sm font-medium">{formatPrice(item.price)}</span>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
