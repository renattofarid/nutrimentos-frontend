import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

const messages = [
  "Obteniendo los registros...",
  "Un momento, casi listo...",
  "Ajustando los campos...",
  "Verificando los datos...",
  "Configurando detalles...",
];

export default function FormSkeleton() {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setIndex((prev) => (prev + 1) % messages.length);
        setVisible(true);
      }, 400);
    }, 1800);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full max-w-(--breakpoint-lg) mx-auto md:p-4 flex flex-col gap-4 h-full items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
      <p
        className="text-sm text-muted-foreground transition-opacity duration-400"
        style={{ opacity: visible ? 1 : 0 }}
      >
        {messages[index]}
      </p>
    </div>
  );
}
