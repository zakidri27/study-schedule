import { useEffect, useRef, useState } from 'react';

interface ComboBoxProps {
  value: string;
  onChange: (value: string) => void;
  options: string[];
  placeholder?: string;
  inputClassName?: string;
}

export default function ComboBox({
  value,
  onChange,
  options,
  placeholder,
  inputClassName,
}: ComboBoxProps) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  const query = value.trim().toLowerCase();
  const list = query && !options.includes(value)
    ? options.filter((o) => o.toLowerCase().includes(query))
    : options;

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const defaultInput =
    'w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 outline-none';

  return (
    <div ref={wrapRef} className="relative">
      {open && list.length > 0 && (
        <ul className="absolute z-30 bottom-full mb-1 w-full max-h-48 overflow-y-auto rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 shadow-2xl">
          {list.map((opt) => (
            <li key={opt}>
              <button
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  onChange(opt);
                  setOpen(false);
                }}
                className={`w-full text-start px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 ${
                  opt === value ? 'font-semibold text-blue-600 dark:text-blue-400' : ''
                }`}
              >
                {opt}
              </button>
            </li>
          ))}
        </ul>
      )}
      <div className="flex">
        <input
          type="text"
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder={placeholder}
          autoComplete="off"
          className={inputClassName || defaultInput}
        />
        {options.length > 0 && (
          <button
            type="button"
            tabIndex={-1}
            onClick={() => setOpen((o) => !o)}
            className="absolute inset-y-0 end-0 flex items-center px-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
          >
            ▾
          </button>
        )}
      </div>
    </div>
  );
}
