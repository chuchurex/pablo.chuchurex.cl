'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import Link from 'next/link'
import Navigation, { navLinks, type Category } from './Navigation'

interface HeaderClientProps {
  categories: Category[]
  scheduleUrl?: string
}

export default function HeaderClient({ categories, scheduleUrl }: HeaderClientProps) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLLIElement>(null)

  const closeMobile = useCallback(() => setMobileOpen(false), [])

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [mobileOpen])

  // Close mobile menu on Escape key
  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setMobileOpen(false)
        setDropdownOpen(false)
      }
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [])

  return (
    <>
      {/* Desktop navigation */}
      <nav className="hidden lg:block" aria-label="Menu principal">
        <ul className="flex items-center gap-1">
          {/* Puentes dropdown */}
          <li ref={dropdownRef} className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              aria-expanded={dropdownOpen}
              aria-haspopup="true"
              className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-foreground hover:text-accent rounded-md transition-colors"
            >
              Puentes
              <svg
                className={`w-4 h-4 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`}
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
              </svg>
            </button>

            {dropdownOpen && (
              <div
                className="absolute left-0 top-full mt-1 w-56 bg-white rounded-lg shadow-lg border border-border py-2 z-50"
                role="menu"
              >
                <Link
                  href="/puentes"
                  onClick={() => setDropdownOpen(false)}
                  className="block px-4 py-2 text-sm font-medium text-foreground hover:bg-accent-light hover:text-accent transition-colors"
                  role="menuitem"
                >
                  Todos los puentes
                </Link>
                {categories.length > 0 && (
                  <div className="border-t border-border my-1" role="separator" />
                )}
                {categories.map((category) => (
                  <Link
                    key={category._id}
                    href={`/puentes/${category.slug}`}
                    onClick={() => setDropdownOpen(false)}
                    className="block px-4 py-2 text-sm text-muted hover:bg-accent-light hover:text-accent transition-colors"
                    role="menuitem"
                  >
                    {category.name}
                  </Link>
                ))}
              </div>
            )}
          </li>

          {/* Static links */}
          {navLinks.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="px-3 py-2 text-sm font-medium text-foreground hover:text-accent rounded-md transition-colors"
              >
                {link.label}
              </Link>
            </li>
          ))}

          {/* CTA */}
          {scheduleUrl && (
            <li>
              <a
                href={scheduleUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-2 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:opacity-90 transition-opacity"
              >
                Agendar hora
              </a>
            </li>
          )}
        </ul>
      </nav>

      {/* Mobile hamburger button */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        aria-expanded={mobileOpen}
        aria-controls="mobile-menu"
        aria-label={mobileOpen ? 'Cerrar menu' : 'Abrir menu'}
        className="lg:hidden relative z-50 p-2 -mr-2 text-foreground hover:text-accent transition-colors"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          aria-hidden="true"
        >
          {mobileOpen ? (
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
          )}
        </svg>
      </button>

      {/* Mobile menu overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-40 lg:hidden"
          aria-hidden="true"
          onClick={closeMobile}
        />
      )}

      {/* Mobile menu panel */}
      <div
        id="mobile-menu"
        className={`fixed top-0 right-0 h-full w-72 bg-white shadow-xl z-40 transform transition-transform duration-300 ease-in-out lg:hidden ${
          mobileOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        aria-hidden={!mobileOpen}
      >
        <div className="pt-20 pb-6 px-4">
          <Navigation
            categories={categories}
            onLinkClick={closeMobile}
            variant="mobile"
            scheduleUrl={scheduleUrl}
          />
        </div>
      </div>
    </>
  )
}
