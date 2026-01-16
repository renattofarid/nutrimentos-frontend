interface Props {
  children?: React.ReactNode;
}

export default function FormWrapper({ children }: Props) {
  return (
    <div className="max-w-(--breakpoint-xl) w-full mx-auto space-y-6">
      {children}
    </div>
  );
}
