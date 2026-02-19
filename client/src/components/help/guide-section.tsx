export default function GuideSection(props: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-white/10 bg-black/20 p-4">
      <h3 className="text-base font-semibold text-white mb-2">{props.title}</h3>
      {props.children}
    </section>
  );
}
