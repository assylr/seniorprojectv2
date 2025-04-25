import { LoadingSpinner } from '@/components/common';
import { useLanguage } from '@/contexts/LanguageContext';
import { RoomDetailDTO } from '@/types';
import React from 'react';
import styles from './RoomTable.module.css';
import RoomTableRow from './RoomTableRow';

interface RoomTableProps {
    rooms: RoomDetailDTO[];
    isLoading: boolean;
}

const RoomTable: React.FC<RoomTableProps> = ({
    rooms,
    isLoading,
}) => {
    const { t } = useLanguage();
    const columnCount = 8;

    return (
        <div className={styles.tableContainer}>
            <table className={styles.roomTable}>
                <thead>
                    <tr>
                        <th>{t('rooms.table.building')}</th>
                        <th>{t('rooms.table.number')}</th>
                        <th>{t('rooms.table.floor')}</th>
                        <th>{t('rooms.table.capacity')}</th>
                        <th>{t('rooms.table.area')}</th>
                        <th>{t('rooms.table.status')}</th>
                        <th>{t('rooms.table.actions')}</th>
                    </tr>
                </thead>
                <tbody>
                    {isLoading && rooms.length === 0 && (
                         <tr>
                             <td colSpan={columnCount} className={styles.loadingCell}>
                                 <LoadingSpinner size="medium" />
                                 <span>{t('rooms.loading')}</span>
                             </td>
                         </tr>
                    )}

                    {!isLoading && rooms.length === 0 && (
                        <tr>
                            <td colSpan={columnCount} className={styles.noResultsCell}>
                                {t('rooms.table.noData')}
                            </td>
                        </tr>
                    )}

                    {!isLoading && rooms.map((room) => (
                        <RoomTableRow
                            key={room.id}
                            room={room}
                        />
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default RoomTable;