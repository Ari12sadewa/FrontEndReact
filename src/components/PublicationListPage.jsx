// src/components/PublicationListPage.jsx
import React, { useState } from 'react';
import { usePublications } from '../hooks/usePublications';
import { useNavigate } from 'react-router-dom';
import { ConfirmMessage } from './confirmationMessege';

const EditButton = ({ pub, type, onClick }) => (
    <button
        onClick={(e) => {
            e.stopPropagation(); // Mencegah propagasi event ke elemen parent
            onClick(pub);
        }}
        className={`${type === "Edit"
            ? 'bg-yellow-500 hover:bg-yellow-600 focus:ring-yellow-400'
            : 'bg-red-600 hover:bg-red-700 focus:ring-red-300'
            } w-20 cursor-pointer text-white font-bold py-2 px-4 rounded transition-all duration-300`}
    >
        {type}
    </button>
);

const SortButton = ({ active, direction, onClick, children }) => (
    <button
        onClick={onClick}
        className={`flex items-center cursor-pointer gap-1 hover:text-blue-200 transition-colors duration-200 ${
            active ? 'text-blue-200' : 'text-white'
        }`}
    >
        {children}
        <span className="text-sm">
            {active ? (direction === 'asc' ? '↑' : '↓') : '↕'}
        </span>
    </button>
);

const EmptyState = ({ searchTerm }) => (
    <div className="text-center py-12">
        <div className="mx-auto h-24 w-24 text-gray-400">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
        </div>
        <p className="text-gray-500 text-lg mt-4">
            {searchTerm ? 'Tidak ada publikasi yang cocok dengan pencarian' : 'Belum ada publikasi yang tersedia'}
        </p>
        <p className="text-gray-400 text-sm mt-2">
            {searchTerm ? 'Coba kata kunci yang berbeda' : 'Silakan tambahkan publikasi baru'}
        </p>
    </div>
);

function highlightText(text, searchTerm) {
    if (!searchTerm) return text;

    const tokens = searchTerm.trim().split(/\s+/).filter(Boolean);
    if (tokens.length === 0) return text;

    const regex = new RegExp(`(${tokens.map(t => escapeRegExp(t)).join('|')})`, 'gi');

    const parts = text.split(regex);

    return parts.map((part, index) => {
        if (regex.test(part)) {
            return `<mark class="bg-blue-200 px-1 rounded">${part}</mark>`;
        }
        return part;
    }).join('');
}

// Utility untuk escape karakter regex khusus
function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export default function PublicationListPage() {
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [tmpPub, setTmpPub] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('date'); // 'date' atau 'title'
    const [sortDirection, setSortDirection] = useState('desc'); // 'asc' atau 'desc'
    const navigate = useNavigate();
    const { publications, deletePublication, } = usePublications();

    const handleEdit = (pub) => navigate(`/publications/edit/${pub.id}`);

    const handleConfirmDelete = (pub) => {
        setTmpPub(pub);
        setShowDeleteConfirm(true);
    };

    const handleDeleteConfirmed = async () => {
        try {
            await deletePublication(tmpPub.id);
        } catch (err) {
            alert('Gagal menghapus: ' + err.message);
        } finally {
            setShowDeleteConfirm(false);
            setTmpPub(null);
        }
    };

    const handleSort = (column) => {
        if (sortBy === column) {
            // Jika kolom yang sama diklik, toggle direction
            setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
        } else {
            // Jika kolom berbeda, set kolom baru dan direction default
            setSortBy(column);
            setSortDirection(column === 'date' ? 'desc' : 'asc');
        }
    };

    const searchToRegex = (input) => {
        const words = input.trim().split(/\s+/); // pisah per kata
        const pattern = words.map((word) => `(?=.*${word})`).join('');
        return new RegExp(pattern, 'i'); // 'i' = ignore case
    };

    const regex = searchToRegex(searchTerm);

    const filteredPublications = publications.filter((pub) => {
        const combinedText = [
            pub.title || '',
            pub.description || '',
            new Date(pub.releaseDate).toLocaleDateString('id-ID', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            })
        ].join(' '); // gabungkan semua kolom jadi satu teks

        return regex.test(combinedText);
    });

    // Sorting logic
    const sortedPublications = [...filteredPublications].sort((a, b) => {
        if (sortBy === 'date') {
            const dateA = new Date(a.releaseDate);
            const dateB = new Date(b.releaseDate);
            return sortDirection === 'asc' ? dateA - dateB : dateB - dateA;
        } else if (sortBy === 'title') {
            const titleA = a.title.toLowerCase();
            const titleB = b.title.toLowerCase();
            if (sortDirection === 'asc') {
                return titleA.localeCompare(titleB);
            } else {
                return titleB.localeCompare(titleA);
            }
        }
        return 0;
    });

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
            <header className="mb-8 text-center md:text-left">
                <h1 className="text-3xl sm:text-4xl font-bold text-gray-800">Daftar Publikasi</h1>
                <p className="text-gray-500 mt-1">Sumber data publikasi terkini ({sortedPublications.length} publikasi)</p>
            </header>

            <div className="mb-6">
                <input
                    type="text"
                    placeholder="Cari publikasi..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring focus:ring-blue-300"
                />
            </div>

            {sortedPublications.length === 0 ? (
                <EmptyState searchTerm={searchTerm} />
            ) : (
                <div className="relative overflow-x-auto shadow-xl rounded-lg">
                    <table className="w-full text-sm text-left text-gray-500">
                        <thead className="text-xs text-center text-white uppercase bg-blue-800">
                            <tr>
                                <th className="px-6 py-3 text-center w-16">No</th>
                                <th className="px-6 py-3 justify-center hover:bg-blue-700 cursor-pointer transition-color duration-500"
                                    onClick={() => handleSort('title')}
                                >
                                    <SortButton
                                        className="px-6 py-3 text-center cursor-pointer"
                                        active={sortBy === 'title'}
                                        direction={sortDirection}
                                    >
                                        Judul
                                    </SortButton>
                                </th>
                                <th className="px-6 py-3 justify-center hover:bg-blue-700  cursor-pointer transition-color duration-500"
                                    onClick={() => handleSort('date')}
                                >
                                    <SortButton
                                        className="px-6 py-3 text-center cursor-pointer"
                                        active={sortBy === 'date'}
                                        direction={sortDirection}
                                    >
                                        Tanggal Rilis
                                    </SortButton>
                                </th>
                                <th className="px-6 py-3 text-center">Sampul</th>
                                <th className="px-6 py-3 text-center">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sortedPublications.map((pub, idx) => (
                                <tr
                                    key={pub.id}
                                    className={`bg-white border-b hover:bg-gray-50 transition-colors duration-200 ${pub.tautan ? 'cursor-pointer hover:bg-sky-100' : ''
                                        }`}
                                    onClick={pub.tautan ? () => window.open(pub.tautan, '_blank') : undefined} // Hanya tambahkan onClick jika tautan tidak null
                                >
                                    <td className="px-6 py-4 text-center font-medium text-gray-900">{idx + 1}</td>
                                    <td className="px-6 py-4">
                                        <a>
                                            <h3
                                                className="font-semibold text-gray-800"
                                                dangerouslySetInnerHTML={{ __html: highlightText(pub.title, searchTerm) }}
                                            />
                                        </a>
                                        {pub.description && (
                                            <p
                                                className="text-gray-600 text-sm mt-1 line-clamp-2"
                                                dangerouslySetInnerHTML={{ __html: highlightText(pub.description, searchTerm) }}
                                            />
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-gray-600">
                                        {new Date(pub.releaseDate).toLocaleDateString('id-ID', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric',
                                        })}
                                    </td>
                                    <td className="px-6 py-4 flex justify-center items-center">
                                        <img
                                            src={pub.coverUrl}
                                            alt={`Sampul ${pub.title}`}
                                            className="h-24 w-auto object-cover rounded shadow-md"
                                            onError={(e) => (e.target.src = 'https://placehold.co/100x140/cccccc/ffffff?text=No+Image')}
                                        />
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col items-center justify-center gap-3">
                                            <EditButton pub={pub} type="Edit" onClick={handleEdit} />
                                            <EditButton pub={pub} type="Hapus" onClick={handleConfirmDelete} />
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            <ConfirmMessage
                visible={showDeleteConfirm}
                onConfirm={handleDeleteConfirmed}
                onCancel={() => setShowDeleteConfirm(false)}
                message={`Apakah Anda yakin ingin menghapus publikasi "${tmpPub?.title}"?`}
            />
        </div>
    );
}
