'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';

function TruncatedText({
  text,
  className = '',
}: {
  text: string;
  className?: string;
}) {
  return (
    <span title={text} className={`block min-w-0 truncate ${className}`}>
      {text}
    </span>
  );
}

export type SelectOption = {
  value: string;
  label: string;
};

export type CourseClassGroup = {
  key: string;
  label: string;
  classes: SelectOption[];
};

const triggerClass =
  'flex h-11 w-full min-w-0 items-center gap-2 rounded-[10px] border border-[#2B332F] bg-[#131716] px-4 text-left text-sm outline-none focus:border-[#157347] focus:ring-2 focus:ring-[#157347]/20';

const panelClass =
  'mt-1 max-h-72 w-full min-w-0 overflow-x-hidden overflow-y-auto rounded-[10px] border border-[#2B332F] bg-[#131716] py-1';

function useClickOutside() {
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handleMouseDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleMouseDown);
    return () => document.removeEventListener('mousedown', handleMouseDown);
  }, []);

  return { rootRef, open, setOpen };
}

/** Selector de una sola lista. Recorta textos largos con "..." en el botón y en cada opción. */
export function AdminEllipsisSelect({
  id,
  value,
  placeholder,
  options,
  onChange,
}: {
  id?: string;
  value: string;
  placeholder: string;
  options: SelectOption[];
  onChange: (value: string) => void;
}) {
  const { rootRef, open, setOpen } = useClickOutside();
  const selected = options.find((option) => option.value === value);

  return (
    <div ref={rootRef} className="w-full min-w-0">
      <button
        type="button"
        id={id}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
        className={triggerClass}
      >
        <TruncatedText
          text={selected?.label ?? placeholder}
          className={`flex-1 ${selected ? 'text-white' : 'text-white/40'}`}
        />
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-white/50 transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>
      {open && (
        <ul role="listbox" className={panelClass}>
          {options.length === 0 ? (
            <li className="px-4 py-2 text-sm text-white/40">No hay opciones</li>
          ) : (
            options.map((option) => (
              <li key={option.value} role="option" aria-selected={option.value === value}>
                <button
                  type="button"
                  onClick={() => {
                    onChange(option.value);
                    setOpen(false);
                  }}
                  className={`flex w-full min-w-0 px-4 py-2 text-left text-sm hover:bg-white/5 ${
                    option.value === value ? 'bg-[#157347]/20 text-white' : 'text-white/85'
                  }`}
                >
                  <TruncatedText text={option.label} className="w-full" />
                </button>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}

/** Selector en dos capas: cursos A–Z que se despliegan para mostrar sus clases. */
export function AdminCourseClassSelect({
  id,
  value,
  placeholder,
  groups,
  onChange,
}: {
  id?: string;
  value: string;
  placeholder: string;
  groups: CourseClassGroup[];
  onChange: (value: string) => void;
}) {
  const { rootRef, open, setOpen } = useClickOutside();
  const [expanded, setExpanded] = useState<string | null>(null);

  const selectedLabel = useMemo(() => {
    for (const group of groups) {
      const match = group.classes.find((item) => item.value === value);
      if (match) return `${match.label} — ${group.label}`;
    }
    return null;
  }, [groups, value]);

  useEffect(() => {
    if (!value) return;
    const group = groups.find((item) => item.classes.some((cls) => cls.value === value));
    if (group) setExpanded(group.key);
  }, [value, groups]);

  return (
    <div ref={rootRef} className="w-full min-w-0">
      <button
        type="button"
        id={id}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
        className={triggerClass}
      >
        <TruncatedText
          text={selectedLabel ?? placeholder}
          className={`flex-1 ${selectedLabel ? 'text-white' : 'text-white/40'}`}
        />
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-white/50 transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>
      {open && (
        <div className={panelClass}>
          {groups.length === 0 ? (
            <p className="px-4 py-2 text-sm text-white/40">No hay cursos</p>
          ) : (
            groups.map((group) => {
              const isOpen = expanded === group.key;
              return (
                <div key={group.key} className="min-w-0">
                  <button
                    type="button"
                    onClick={() => setExpanded(isOpen ? null : group.key)}
                    className="flex w-full min-w-0 items-center gap-2 px-3 py-2 text-left text-sm font-medium text-white hover:bg-white/5"
                  >
                    {isOpen ? (
                      <ChevronDown className="h-4 w-4 shrink-0 text-white/50" />
                    ) : (
                      <ChevronRight className="h-4 w-4 shrink-0 text-white/50" />
                    )}
                    <TruncatedText text={group.label} className="flex-1 text-white" />
                    <span className="shrink-0 text-xs text-white/40">{group.classes.length}</span>
                  </button>
                  {isOpen &&
                    (group.classes.length === 0 ? (
                      <p className="px-9 py-1.5 text-xs text-white/40">Este curso no tiene clases</p>
                    ) : (
                      group.classes.map((cls) => (
                        <button
                          key={cls.value}
                          type="button"
                          onClick={() => {
                            onChange(cls.value);
                            setOpen(false);
                          }}
                          className={`flex w-full min-w-0 py-2 pl-9 pr-3 text-left text-sm hover:bg-white/5 ${
                            cls.value === value
                              ? 'bg-[#157347]/20 text-white'
                              : 'text-white/80'
                          }`}
                        >
                          <TruncatedText text={cls.label} className="w-full" />
                        </button>
                      ))
                    ))}
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
