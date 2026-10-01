import { FAQ_ITEMS, type FaqItem } from '../content/faq';
import { Icon } from './Icon';

export function FaqList({ items = FAQ_ITEMS, headingLevel = 3 }: { items?: FaqItem[]; headingLevel?: 2 | 3 }) {
  const Heading = headingLevel === 2 ? 'h2' : 'h3';
  return (
    <div className="faq-list">
      {items.map((item) => (
        <details key={item.id} className="faq-item" id={`faq-${item.id}`}>
          <summary>
            <Heading className="faq-q">{item.question}</Heading>
            <Icon name="chevronDown" />
          </summary>
          <p>{item.answer}</p>
        </details>
      ))}
    </div>
  );
}
