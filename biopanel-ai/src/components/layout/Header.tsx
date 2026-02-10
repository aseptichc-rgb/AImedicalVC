'use client';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import Button from '../ui/Button';

export default function Header() {
  const { user, loading, logout } = useAuth();

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">BP</span>
              </div>
              <span className="text-xl font-bold text-gray-900">BioPanel AI</span>
            </Link>
            {user && (
              <nav className="hidden md:flex items-center gap-6">
                <Link href="/dashboard" className="text-gray-600 hover:text-gray-900 font-medium text-sm">Dashboard</Link>
                <Link href="/analysis/new" className="text-gray-600 hover:text-gray-900 font-medium text-sm">새 분석</Link>
                <Link href="/experts" className="text-gray-600 hover:text-gray-900 font-medium text-sm">전문가</Link>
              </nav>
            )}
          </div>
          <div className="flex items-center gap-4">
            {loading ? (
              <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse" />
            ) : user ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  {user.photoURL && (
                    <img src={user.photoURL} alt="" className="w-8 h-8 rounded-full" />
                  )}
                  <span className="text-sm font-medium text-gray-700 hidden sm:block">{user.displayName}</span>
                </div>
                <Button variant="ghost" size="sm" onClick={logout}>로그아웃</Button>
              </div>
            ) : (
              <Link href="/login">
                <Button size="sm">로그인</Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
