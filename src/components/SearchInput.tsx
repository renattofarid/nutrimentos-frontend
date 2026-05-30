import { Input } from "@/components/ui/input";
import { useEffect, useRef, useState } from "react";

export default function SearchInput({
  value,
  onChange,
  placeholder = "Buscar...",
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  const [inputValue, setInputValue] = useState(value);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  useEffect(() => {
    const timer = setTimeout(() => {
      onChangeRef.current(inputValue);
    }, 300);
    return () => clearTimeout(timer);
  }, [inputValue]);

  return (
    <Input
      className="w-full md:w-64 h-8"
      variant="default"
      placeholder={placeholder}
      value={inputValue}
      onChange={(e) => setInputValue(e.target.value)}
    />
  );
}
