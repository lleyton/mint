import Link from 'next/link';

import AlertIcon from './Alert';
import EditIcon from './Edit';

export enum FeedbackButtonIconType {
  Edit,
  Alert,
}

const Tooltip = ({ message }: { message: string }) => {
  return (
    <div className="absolute hidden group-hover:block bottom-full left-1/2 mb-3.5 pb-1 -translate-x-1/2">
      <div
        className="relative w-24 flex justify-center bg-primary-dark text-white text-xs font-medium py-0.5 px-1.5 rounded-lg"
        data-reach-alert="true"
      >
        {message}
        <svg
          aria-hidden="true"
          width="16"
          height="6"
          viewBox="0 0 16 6"
          className="text-primary-dark absolute top-full left-1/2 -mt-px -ml-2"
        >
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M15 0H1V1.00366V1.00366V1.00371H1.01672C2.72058 1.0147 4.24225 2.74704 5.42685 4.72928C6.42941 6.40691 9.57154 6.4069 10.5741 4.72926C11.7587 2.74703 13.2803 1.0147 14.9841 1.00371H15V0Z"
            fill="currentColor"
          ></path>
        </svg>
      </div>
    </div>
  );
};

const IconButton = ({
  href,
  tooltip,
  className,
  type,
}: {
  href: string;
  tooltip?: string;
  type: FeedbackButtonIconType;
  className?: string;
}) => {
  return (
    <Link href={href} className={className} target="_blank" rel="noopener noreferrer">
      {type === FeedbackButtonIconType.Alert && <AlertIcon />}
      {type === FeedbackButtonIconType.Edit && <EditIcon />}
      {tooltip && <Tooltip message={tooltip} />}
    </Link>
  );
};

export default IconButton;
