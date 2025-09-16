import { useEffect, useState } from "react";
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
  /** currently selected category slug from URL (or "all") */
  selectedSlug?: string;
  /** called when user toggles a node */
  onPick: (slug: string) => void;
  /** depth for /categories/tree (1..6) */
  depth?: number;
  /** show aggregated count on each node (requires BE includeCounts=true) */
  showCount?: boolean;
  /** initially expand N levels */
  initialOpenLevels?: number;
  /** className passthrough */
  className?: string;
};

export default function CategoryTreeFilter({
  root,
  selectedSlug,
  onPick,
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
    return () => { alive = false; };
  }, [root, depth, showCount]);

  if (loading) return <div className="text-sm text-gray-500">Đang tải {root === "men" ? "Nam" : "Nữ"}...</div>;
  if (error) return <div className="text-sm text-red-600">Lỗi: {error}</div>;
  if (!tree) return <div className="text-sm text-gray-500">Không có dữ liệu</div>;

  return (
    <div className={className}>
      <TreeNode
        node={tree}
        level={0}
        openDefaultLevels={initialOpenLevels}
        selectedSlug={selectedSlug}
        onPick={onPick}
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
  selectedSlug?: string;
  onPick: (slug: string) => void;
  showCount: boolean;
  isRoot?: boolean;
};

function TreeNode({
  node,
  level,
  openDefaultLevels,
  selectedSlug,
  onPick,
  showCount,
  isRoot = false,
}: NodeProps) {
  const [open, setOpen] = useState(level < openDefaultLevels);
  const hasChildren = (node.children?.length ?? 0) > 0;

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
          onClick={() => setOpen(v => !v)}
        >
          {open ? "▾" : "▸"}
        </button>
      ) : (
        <span className="w-0.5" />
      )}

      {/* single-select checkbox */}
      {!isRoot && (
        <input
          type="checkbox"
          className="cursor-pointer size-4"
          checked={selectedSlug === node.slug}
          onChange={() => onPick(node.slug)}
        />
      )}

      {/* {isRoot ? <span className="font-medium">{label}</span> : label} */}
      {isRoot ? (
        <button
          type="button"
          onClick={() => onPick(node.slug)}
          className={`font-medium cursor-pointer transition-colors duration-200 
              hover:text-amber-700 ${selectedSlug === node.slug ? "text-amber-700" : ""}`}
          aria-pressed={selectedSlug === node.slug}
        >
          {label}
        </button>
      ) : label}
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
              selectedSlug={selectedSlug}
              onPick={onPick}
              showCount={showCount}
            />
          ))}
        </div>
      )}
    </div>
  );
}
