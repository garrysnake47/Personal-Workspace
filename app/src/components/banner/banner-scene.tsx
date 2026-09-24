import Image from "next/image";

/**
 * Background photography only. Navigation, copy and controls
 * are independent DOM/SVG layers above it; the page never uses a full-page
 * screenshot or image-map hotspots.
 */
export function BannerScene() {
  return (
    <div className="bn-scene absolute inset-0 overflow-hidden" aria-hidden="true">
      <Image
        src="/Images/banner/scene-workspace-v3.png"
        alt=""
        fill
        priority
        sizes="100vw"
        className="bn-scene-photo bn-scene-photo-light object-cover object-right"
      />
      <Image
        src="/Images/banner/scene-workspace-dark-v2.png"
        alt=""
        fill
        priority
        sizes="100vw"
        className="bn-scene-photo bn-scene-photo-dark object-cover object-right"
      />
      <div className="bn-scene-night absolute inset-0" />
    </div>
  );
}
