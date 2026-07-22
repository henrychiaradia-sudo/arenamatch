import { SectionHeading } from '@/components/ui/section-heading';

export function PageIntro({
  eyebrow,
  title,
  description,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
}) {
  return (
    <section className="border-b bg-hero-grid">
      <div className="container py-16 md:py-20">
        <SectionHeading eyebrow={eyebrow} title={title} description={description} />
      </div>
    </section>
  );
}
