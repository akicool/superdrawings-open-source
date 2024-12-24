import { getStroke } from "perfect-freehand";
import { ChangeEvent, useCallback, useEffect, useRef, useState } from "react";
import clsx from "clsx";
import {
  IconArrowBackUp,
  IconArrowForwardUp,
  IconEraser,
  IconTrash,
} from "@tabler/icons-react";

import { getSvgPathFromStroke, handleSave, getOptions } from "../utils";
import { EMPTY_COLOR, SIZES } from "../constants";
import { TypePath } from "../types/board";

export const Board = () => {
  const svgRef = useRef<SVGSVGElement>(null);

  const [points, setPoints] = useState<number[][]>([]);
  const [pathArray, setPathArray] = useState<TypePath[]>([]);
  const [tempPath, setTempPath] = useState<TypePath["path"] | null>(null);

  const [history, setHistory] = useState<TypePath[][]>([]);
  const [future, setFuture] = useState<TypePath[][]>([]);

  const [colorHistory, setColorHistory] = useState<string>("#fff");
  const [color, setColor] = useState<string>("#fff");
  const [size, setSize] = useState<number>(6);
  const [isErase, setIsErase] = useState<boolean>(false);

  const options = getOptions(size, Boolean(color === EMPTY_COLOR));

  const handlePointerDown = (e: any) => {
    e.target.setPointerCapture(e.pointerId);
    setPoints([[e.pageX, e.pageY, e.pressure]]);
    if (history.length === 0) setHistory([[]]);
  };

  const handlePointerMove = useCallback(
    (e: any) => {
      if (e.buttons !== 1) return;

      const newPoints = [...points, [e.pageX, e.pageY, e.pressure]];
      setPoints(newPoints);

      const stroke = getStroke(newPoints, options);
      setTempPath(getSvgPathFromStroke(stroke));
    },
    [options, points],
  );

  const handlePointerUp = useCallback(() => {
    if (points.length === 0) return;

    const stroke = getStroke(points, options);
    const pathData = getSvgPathFromStroke(stroke);

    const newPath = { path: pathData, color };
    setPathArray((prev) => [...prev, newPath]);

    setHistory((prev) => [...prev, [...pathArray, newPath]]);
    setFuture([]);

    setTempPath(null);
    setPoints([]);
  }, [color, options, pathArray, points]);

  const handleUndo = () => {
    if (history.length <= 1) return;

    const newHistory = [...history];
    const lastState = newHistory.pop();

    if (lastState) {
      setFuture((prev) => [pathArray, ...prev]);
      setPathArray(newHistory[newHistory.length - 1] || []);
      setHistory(newHistory);
    }
  };

  const handleRedo = () => {
    if (future.length === 0) return;

    const nextState = future[0];
    setFuture((prev) => prev.slice(1));
    setHistory((prev) => [...prev, pathArray]);
    setPathArray(nextState);
  };

  const handleErase = () => {
    setIsErase((prev) => !prev);
    setColor(EMPTY_COLOR);
  };

  const handleColorChange = (e: ChangeEvent<HTMLInputElement>) => {
    setColor(e.target.value);
    setColorHistory(e.target.value);
    setIsErase(false);
  };

  const handleClear = () => {
    setPathArray([]);
    setHistory([]);
    setFuture([]);
    setIsErase(false);
  };

  useEffect(() => {
    if (isErase) {
      setColor(EMPTY_COLOR);
    } else {
      setColor(colorHistory);
    }
  }, [isErase]);

  console.log("render");

  return (
    <div className="relative h-dvh w-screen bg-[#1a1a1a]">
      <svg
        ref={svgRef}
        className="absolute size-full"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        style={{ touchAction: "none" }}
        viewBox={`0 0 ${svgRef.current?.clientWidth} ${svgRef.current?.clientHeight}`}
      >
        {pathArray.map((entry, index) => (
          <path key={index} d={entry.path} fill={entry.color} />
        ))}

        {tempPath && <path d={tempPath} fill={color} />}
      </svg>

      <div className="relative z-10 flex w-full items-center justify-between gap-4 p-4">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="hidden items-center gap-4 sm:flex">
              <button type="button" onClick={handleClear} className="border-4">
                <IconTrash />
              </button>

              <button type="button" onClick={handleUndo} className="border-4">
                <IconArrowBackUp />
              </button>

              <button type="button" onClick={handleRedo} className="border-4">
                <IconArrowForwardUp />
              </button>

              <button
                type="button"
                onClick={handleErase}
                className={clsx("border-4", isErase && "border-green-800")}
              >
                <IconEraser />
              </button>
            </div>

            <label className="relative flex size-[3.125rem] cursor-pointer items-center justify-center overflow-hidden">
              <input
                type="color"
                value={color}
                className="size-10 rounded-full border-2 p-0"
                style={{ backgroundColor: color }}
                onChange={(e) => handleColorChange(e)}
              />
              <div className="absolute size-[1.875rem] cursor-[inherit] rounded-full bg-white" />
            </label>
          </div>

          <div className="flex items-center gap-2">
            {SIZES.map((sizeItem, idx) => (
              <button
                key={idx}
                className={clsx(
                  "size-10 rounded-full border-2 p-0",
                  sizeItem.value === size && "border-solid border-blue-400",
                )}
                style={{
                  width: sizeItem.value * 2,
                  height: sizeItem.value * 2,
                  backgroundColor: "red",
                }}
                onClick={() => setSize(sizeItem.value)}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 flex w-full items-end justify-between p-4 sm:justify-end">
        <div className="grid grid-cols-2 items-center gap-4 sm:hidden">
          <button type="button" onClick={handleClear} className="border-4">
            <IconTrash />
          </button>

          <button
            type="button"
            onClick={handleErase}
            className={clsx("border-4", isErase && "border-green-800")}
          >
            <IconEraser />
          </button>

          <button type="button" onClick={handleUndo} className="border-4">
            <IconArrowBackUp />
          </button>

          <button type="button" onClick={handleRedo} className="border-4">
            <IconArrowForwardUp />
          </button>
        </div>

        <button onClick={() => handleSave(svgRef)}>Save</button>
      </div>
    </div>
  );
};
