import HeaderComponent from "./header";
import { AuthInitializer } from "./AuthInitializer";

interface Props {
  children: React.ReactNode;
}

export default function LayoutComponent({ children }: Props) {
  return (
    <div className="flex flex-col min-h-screen">
      <AuthInitializer />
      <HeaderComponent />
      <div className="flex flex-1 flex-col gap-4 p-4 w-full">{children}</div>
    </div>
  );
}
