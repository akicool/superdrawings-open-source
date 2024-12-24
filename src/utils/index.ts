import { RefObject } from "react";
import { EMPTY_COLOR } from "../constants";

export function getSvgPathFromStroke(stroke: number[][]) {
  if (!stroke.length) return "";

  const d = stroke.reduce(
    (acc, [x0, y0], i, arr) => {
      const [x1, y1] = arr[(i + 1) % arr.length];
      acc.push(x0, y0, (x0 + x1) / 2, (y0 + y1) / 2);
      return acc;
    },
    ["M", ...stroke[0], "Q"],
  );

  d.push("Z");
  return d.join(" ");
}

export const getOptions = (size: number = 6, eraseMode = false) => ({
  size: size,
  thinning: 0.5,
  smoothing: 0.5,
  streamline: 0.5,
  easing: (t: number) => t,
  start: {
    taper: 0,
    easing: (t: number) => t,
    cap: true,
  },
  end: {
    taper: eraseMode ? 0 : 100,
    easing: (t: number) => t,
    cap: true,
  },
});

// TODO: to save on your own computer
export const handleSave = (svgRef: RefObject<SVGSVGElement>) => {
  if (!svgRef.current) return;

  const svgElement = svgRef.current;
  const serializer = new XMLSerializer();
  const svgString = serializer.serializeToString(svgElement);

  const svgBlob = new Blob([svgString], { type: "image/svg+xml" });
  const svgUrl = URL.createObjectURL(svgBlob);

  const img = new Image();
  img.onload = () => {
    const canvas = document.createElement("canvas");
    canvas.width = svgElement.clientWidth;
    canvas.height = svgElement.clientHeight;

    const ctx = canvas.getContext("2d");

    if (ctx) {
      ctx.fillStyle = EMPTY_COLOR;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.drawImage(img, 0, 0);

      const pngUrl = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.href = pngUrl;
      link.download = `${Date.now()}_drawing.png`;
      link.click();
    }
    URL.revokeObjectURL(svgUrl);
  };
  img.src = svgUrl;
};
