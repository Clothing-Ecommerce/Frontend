import { useEffect, useState, useMemo } from "react";
import api from "@/utils/axios";

export type CategoryNode = {
  id: number;
  name: string;
  slug: string;
  count?: number;
  children: CategoryNode[];
};

type Props = {
  /** "men" | "women" */
  root: string;
  /** danh sách slug đang chọn (toàn cục, dùng chung cho cả 2 cây) */
  selectedSlugs: string[];
  /** trả về danh sách đã CHUẨN HÓA sau khi toggle (đã áp dụng quy tắc root↔child) */
  onChange: (nextSelected: string[]) => void;
  depth?: number;
  showCount?: boolean;
  initialOpenLevels?: number;
  className?: string;
};

export default function CategoryTreeFilter({
  root,
  selectedSlugs,
  onChange,
  depth = 3,
  showCount = true,
  initialOpenLevels = 1,
  className = "",
}: Props) {
  const [tree, setTree] = useState<CategoryNode | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await api.get("/categories/tree", {
          params: { root, depth, includeCounts: showCount ? "true" : "false" },
        });
        if (!alive) return;
        setTree(res.data);
      } catch (e: any) {
        if (!alive) return;
        setError(e?.response?.data?.message || "Failed to load categories");
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [root, depth, showCount]);

  // ====== Build index: ancestors & descendants for quick rules ======
  const { rootSlug, ancestorsMap, descendantsMap } = useMemo(() => {
    const ancestors = new Map<string, string[]>(); // slug -> [ancestors...]
    const descendants = new Map<string, Set<string>>(); // slug -> Set(descendants)
    let _rootSlug = "";

    function walk(node: CategoryNode, chain: string[]) {
      if (!chain.length) _rootSlug = node.slug;
      ancestors.set(node.slug, chain);

      // collect descendants via DFS
      const set = new Set<string>();
      function collect(n: CategoryNode) {
        for (const ch of n.children ?? []) {
          set.add(ch.slug);
          collect(ch);
        }
      }
      collect(node);
      descendants.set(node.slug, set);

      for (const ch of node.children ?? []) {
        walk(ch, [...chain, node.slug]);
      }
    }

    if (tree) walk(tree, []);
    return { rootSlug: _rootSlug, ancestorsMap: ancestors, descendantsMap: descendants };
  }, [tree]);

  const handleToggle = (slug: string) => {
    const next = new Set(selectedSlugs);
    const isSelected = next.has(slug);

    if (isSelected) {
      // uncheck: chỉ gỡ chính nó
      next.delete(slug);
      onChange(Array.from(next));
      return;
    }

    // add
    next.add(slug);

    if (slug === rootSlug) {
      // Chọn root: gỡ toàn bộ descendants của root
      for (const d of descendantsMap.get(slug) ?? []) next.delete(d);
    } else {
      // Chọn child: gỡ toàn bộ ancestors (bao gồm root nếu có)
      for (const a of ancestorsMap.get(slug) ?? []) next.delete(a);
    }

    onChange(Array.from(next));
  };

  if (loading) return <div className="text-sm text-gray-500">Loading {root === "men" ? "Nam" : "Nữ"}...</div>;
  if (error) return <div className="text-sm text-red-600">Error: {error}</div>;
  if (!tree) return <div className="text-sm text-gray-500">No data</div>;

  return (
    <div className={className}>
      <TreeNode
        node={tree}
        level={0}
        openDefaultLevels={initialOpenLevels}
        selectedSlugs={selectedSlugs}
        onToggle={handleToggle}
        showCount={showCount}
        isRoot
      />
    </div>
  );
}

type NodeProps = {
  node: CategoryNode;
  level: number;
  openDefaultLevels: number;
  selectedSlugs: string[];
  onToggle: (slug: string) => void;
  showCount: boolean;
  isRoot?: boolean;
};

function TreeNode({
  node,
  level,
  openDefaultLevels,
  selectedSlugs,
  onToggle,
  showCount,
  isRoot = false,
}: NodeProps) {
  const [open, setOpen] = useState(level < openDefaultLevels);
  const hasChildren = (node.children?.length ?? 0) > 0;
  const checked = selectedSlugs.includes(node.slug);

  const label = (
    <span className="text-sm">
      {node.name}
      {showCount && node.count != null ? ` (${node.count})` : ""}
    </span>
  );

  const row = (
    <div className="flex items-center gap-2">
      {hasChildren ? (
        <button
          type="button"
          aria-label={open ? "Collapse" : "Expand"}
          className="select-none text-xs w-5 h-5 rounded hover:bg-gray-100"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? "▾" : "▸"}
        </button>
      ) : (
        <span className="w-0.5" />
      )}

      {!isRoot && (
        <input
          type="checkbox"
          className="cursor-pointer size-4"
          checked={checked}
          onChange={() => onToggle(node.slug)}
        />
      )}

      {isRoot ? (
        <button
          type="button"
          onClick={() => onToggle(node.slug)}
          className={`font-medium cursor-pointer transition-colors duration-200 hover:text-amber-700 ${
            checked ? "text-amber-700" : ""
          }`}
          aria-pressed={checked}
        >
          {label}
        </button>
      ) : (
        <button
          type="button"
          className={`text-left ${checked ? "text-amber-700" : ""}`}
          onClick={() => onToggle(node.slug)}
        >
          {label}
        </button>
      )}
    </div>
  );

  return (
    <div className="mb-1">
      {row}
      {hasChildren && open && (
        <div className="ml-5 mt-1">
          {node.children.map((ch) => (
            <TreeNode
              key={ch.slug}
              node={ch}
              level={level + 1}
              openDefaultLevels={openDefaultLevels}
              selectedSlugs={selectedSlugs}
              onToggle={onToggle}
              showCount={showCount}
            />
          ))}
        </div>
      )}
    </div>
  );
}