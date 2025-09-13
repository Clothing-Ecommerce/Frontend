import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { ProductImage } from "@/types/productType";

type MediaGalleryProps = {
  images: ProductImage[];
  initialIndex?: number;
};

export function MediaGallery({ images, initialIndex = 0 }: MediaGalleryProps) {
  const itemHeightRef = useRef<number>(0);
  const [current, setCurrent] = useState(initialIndex);

  // refs
  const mainRef = useRef<HTMLDivElement | null>(null);
  const thumbWrapRef = useRef<HTMLDivElement | null>(null);
  const thumbListRef = useRef<HTMLDivElement | null>(null);

  // helper: Đo chiều cao 1 thumbnail (kèm margin-bottom)
  const getItemHeight = () => {
    if (itemHeightRef.current) return itemHeightRef.current;
    const el = thumbListRef.current?.querySelector("button");
    if (!el) return 180 + 12; // fallback gần đúng
    const rect = el.getBoundingClientRect();
    const styles = getComputedStyle(el);
    const mb = parseFloat(styles.marginBottom || "0");
    itemHeightRef.current = rect.height + mb; // gồm border + padding + mb
    return itemHeightRef.current;
  };

  // Đồng bộ chiều cao cột thumbnail = chiều cao khung ảnh
  useLayoutEffect(() => {
    const syncHeight = () => {
      if (!mainRef.current || !thumbWrapRef.current) return;
      
      // Lấy chiều cao thực tế của khung ảnh chính (bao gồm cả aspect ratio)
      const mainImageContainer = mainRef.current.querySelector('.aspect-\\[2\\/3\\]');
      if (mainImageContainer) {
        const h = mainImageContainer.getBoundingClientRect().height;
        thumbWrapRef.current.style.height = `${h}px`;
        itemHeightRef.current = 0; // Reset để tính lại
      }
    };

    // Sync ngay lập tức
    syncHeight();

    // Theo dõi thay đổi kích thước
    if (mainRef.current) {
      const ro = new ResizeObserver(() => {
        syncHeight();
      });
      ro.observe(mainRef.current);
      
      // Cũng theo dõi container chứa aspect ratio
      const aspectContainer = mainRef.current.querySelector('.aspect-\\[2\\/3\\]');
      if (aspectContainer) {
        ro.observe(aspectContainer as Element);
      }

      return () => ro.disconnect();
    }
  }, []);

  // Thêm listener cho window resize để đảm bảo sync đúng
  useEffect(() => {
    const handleResize = () => {
      if (!mainRef.current || !thumbWrapRef.current) return;
      
      setTimeout(() => {
        const mainImageContainer = mainRef.current!.querySelector('.aspect-\\[2\\/3\\]');
        if (mainImageContainer) {
          const h = mainImageContainer.getBoundingClientRect().height;
          thumbWrapRef.current!.style.height = `${h}px`;
          itemHeightRef.current = 0;
        }
      }, 100); // Delay nhỏ để đảm bảo layout đã stable
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Đảm bảo thumbnail đang chọn luôn trong vùng nhìn thấy
  const scrollToThumbnail = (index: number) => {
    if (!thumbWrapRef.current || !thumbListRef.current) return;
    const container = thumbWrapRef.current;
    const list = thumbListRef.current;

    const itemH = getItemHeight();             // ✅ dùng số đo thực
    const containerH = container.clientHeight;

    const targetTop = index * itemH;
    const targetBottom = targetTop + (itemH - 12); // trừ mb (space-y-3 = 12px)

    const viewTop = list.scrollTop;
    const viewBottom = viewTop + containerH;

    let newTop = viewTop;
    if (targetTop < viewTop) newTop = targetTop;
    else if (targetBottom > viewBottom) newTop = targetBottom - containerH;

    if (newTop !== viewTop) list.scrollTo({ top: newTop, behavior: "smooth" });
  };
  
  // gọi khi đổi ảnh
  const go = (delta: number) => {
    if (!images?.length) return;
    const next = (current + delta + images.length) % images.length;
    setCurrent(next);
    scrollToThumbnail(next);
  };

  // lần đầu: cuộn tới initialIndex
  useEffect(() => {
    if (initialIndex) scrollToThumbnail(initialIndex);
  }, []);

  return (
    <div className="grid grid-cols-[140px_1fr] gap-6">
      {/* Cột thumbnail - Tăng kích thước từ 96px lên 140px */}
      <div
        ref={thumbWrapRef}
        className="relative overflow-hidden rounded-2xl"
        style={{
          scrollbarWidth: "none" as any,
          msOverflowStyle: "none" as any,
        }}
      >
        <div
          ref={thumbListRef}
          className="h-full overflow-y-auto"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          data-hide-scrollbar
        >
          <style>{
            `[data-hide-scrollbar]::-webkit-scrollbar{ display: none; }`
          }</style>

          <div data-hide-scrollbar className="space-y-3">
            {images?.map((img, i) => (
              <button
                key={img.id ?? img.url ?? i}
                onClick={() => {
                  setCurrent(i);
                  scrollToThumbnail(i);
                }}
                className={[
                  "w-full aspect-[3/4] overflow-hidden rounded-xl border-2 transition-all duration-200",
                  i === current
                    ? "border-gray-900 ring-2 ring-gray-300"
                    : "border-gray-200 hover:border-gray-400",
                ].join(" ")}
              >
                <img
                  src={img.url}
                  alt={`Thumb ${i + 1}`}
                  className="w-full h-full object-cover"
                  draggable={false}
                  loading="lazy"
                  decoding="async"
                />
              </button>
            ))}
            <div style={{ height: 8 }} />
          </div>
        </div>
      </div>

      {/* Khung ảnh chính + nút điều hướng */}
      <div ref={mainRef} className="relative rounded-2xl overflow-hidden">
        <div className="w-full aspect-[2/3] bg-gray-50">
          <img
            src={images?.[current]?.url}
            alt={images?.[current]?.alt ?? `Image ${current + 1}`}
            className="w-full h-full object-cover"
            draggable={false}
          />
        </div>

        {/* Nút điều hướng */}
        <button
          onClick={() => go(-1)}
          className="absolute left-4 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full bg-white/90 backdrop-blur border shadow-lg hover:bg-white hover:shadow-xl transition-all duration-200"
          aria-label="Previous image"
        >
          <ChevronLeft className="mx-auto w-6 h-6 text-gray-700" />
        </button>
        
        <button
          onClick={() => go(1)}
          className="absolute right-4 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full bg-white/90 backdrop-blur border shadow-lg hover:bg-white hover:shadow-xl transition-all duration-200"
          aria-label="Next image"
        >
          <ChevronRight className="mx-auto w-6 h-6 text-gray-700" />
        </button>
      </div>
    </div>
  );
}