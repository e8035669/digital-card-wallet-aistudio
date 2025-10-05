import React, { useEffect, useRef } from 'react';

declare var JsBarcode: any;

interface BarcodeProps {
  value: string;
}

const Barcode: React.FC<BarcodeProps> = ({ value }) => {
  const svgRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    if (svgRef.current && value) {
      try {
        JsBarcode(svgRef.current, value, {
          format: "CODE128",
          lineColor: "#000000",
          background: "#ffffff",
          displayValue: true,
          font: "monospace",
          fontOptions: "bold",
          fontSize: 16,
          textColor: "#000000",
          margin: 10,
        });
      } catch (e) {
        console.error("JsBarcode error:", e);
      }
    }
  }, [value]);

  return <svg ref={svgRef} className="w-full h-auto"></svg>;
};

export default Barcode;