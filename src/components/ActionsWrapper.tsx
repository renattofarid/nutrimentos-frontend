interface Props {
  children?: React.ReactNode;
}

export default function ActionsWrapper({ children }: Props) {
  return (
    <div className="flex flex-wrap items-center md:justify-start gap-1 mb-1 pb-1 border-b w-full">
      {children}
    </div>
  );
}
