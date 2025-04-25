import React, { createContext, ReactNode, useContext, useState } from 'react'

export type Language = 'en' | 'kk' | 'ru';

type TranslationKey = 
    | 'login'
    | 'logout'
    | 'language'
    | 'english'
    | 'kazakh'
    // Navigation
    | 'nav.blocks'
    | 'nav.rooms'
    | 'nav.tenants'
    | 'nav.maintenance'
    | 'nav.utilityBilling'
    | 'nav.reports'
    // Buildings Page
    | 'buildings.title'
    | 'buildings.sortBy'
    | 'buildings.buildingNumber'
    | 'buildings.occupancyHighest'
    | 'buildings.totalRoomsHighest'
    | 'buildings.loading'
    | 'buildings.noData'
    | 'buildings.error'
    | 'buildings.floors'
    | 'buildings.totalRooms'
    | 'buildings.occupied'
    | 'buildings.occupancy'
    // Rooms Page
    | 'rooms.title'
    | 'rooms.loading'
    | 'rooms.error.fetch'
    | 'rooms.error.filters'
    | 'rooms.filters.building'
    | 'rooms.filters.status'
    | 'rooms.filters.bedrooms'
    | 'rooms.filters.all'
    | 'rooms.status.available'
    | 'rooms.status.occupied'
    | 'rooms.status.maintenance'
    | 'rooms.table.number'
    | 'rooms.table.building'
    | 'rooms.table.type'
    | 'rooms.table.bedrooms'
    | 'rooms.table.status'
    | 'rooms.table.tenant'
    | 'rooms.table.actions'
    | 'rooms.table.noData'
    // Maintenance
    | 'maintenance.management'
    | 'maintenance.newRequest'
    | 'maintenance.cancel'
    | 'maintenance.room'
    | 'maintenance.tenant'
    | 'maintenance.category'
    | 'maintenance.priority'
    | 'maintenance.description'
    | 'maintenance.notes'
    | 'maintenance.submit'
    | 'maintenance.submitting'
    | 'maintenance.filters'
    | 'maintenance.allStatuses'
    | 'maintenance.allCategories'
    | 'maintenance.allPriorities'
    | 'maintenance.requestDetails'
    | 'maintenance.requestId'
    | 'maintenance.status'
    | 'maintenance.submittedDate'
    | 'maintenance.assignedTo'
    | 'maintenance.scheduledDate'
    | 'maintenance.completedDate'
    | 'maintenance.updateRequest'
    | 'maintenance.noChange'
    | 'maintenance.requestHistory'
    | 'maintenance.noUpdates'
    | 'maintenance.updatedBy'
    | 'maintenance.view'
    | 'maintenance.notAssigned'
    | 'maintenance.notScheduled'
    | 'maintenance.notCompleted'
    | 'maintenance.unknown';

interface Translations {
    [key: string]: {
        [K in TranslationKey]: string;
    };
}

interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: (key: TranslationKey) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const translations: Translations = {
    en: {
        // Common
        'login': 'Login',
        'logout': 'Logout',
        'language': 'Language',
        'english': 'English',
        'kazakh': 'Kazakh',
        
        // Navigation
        'nav.blocks': 'Blocks',
        'nav.rooms': 'Rooms',
        'nav.tenants': 'Tenants',
        'nav.maintenance': 'Maintenance',
        'nav.utilityBilling': 'Utility Billing',
        'nav.reports': 'Reports',

        // Buildings Page
        'buildings.title': 'Blocks',
        'buildings.sortBy': 'Sort by:',
        'buildings.buildingNumber': 'Building Number',
        'buildings.occupancyHighest': 'Occupancy (Highest)',
        'buildings.totalRoomsHighest': 'Total Rooms (Highest)',
        'buildings.loading': 'Loading buildings...',
        'buildings.noData': 'No buildings found.',
        'buildings.error': 'Failed to fetch building data',
        'buildings.floors': 'Floors',
        'buildings.totalRooms': 'Total Rooms',
        'buildings.occupied': 'Occupied',
        'buildings.occupancy': 'Occupancy',

        // Rooms Page
        'rooms.title': 'Rooms',
        'rooms.loading': 'Loading rooms...',
        'rooms.error.fetch': 'Failed to fetch room data',
        'rooms.error.filters': 'Could not load filter options.',
        'rooms.filters.building': 'Building',
        'rooms.filters.status': 'Status',
        'rooms.filters.bedrooms': 'Bedrooms',
        'rooms.filters.all': 'All',
        'rooms.status.available': 'Available',
        'rooms.status.occupied': 'Occupied',
        'rooms.status.maintenance': 'Under Maintenance',
        'rooms.table.number': 'Room Number',
        'rooms.table.building': 'Building',
        'rooms.table.type': 'Type',
        'rooms.table.bedrooms': 'Bedrooms',
        'rooms.table.status': 'Status',
        'rooms.table.tenant': 'Tenant',
        'rooms.table.actions': 'Actions',
        'rooms.table.noData': 'No rooms found',
        
        // Maintenance
        'maintenance.management': 'Maintenance Management',
        'maintenance.newRequest': 'New Maintenance Request',
        'maintenance.cancel': 'Cancel',
        'maintenance.room': 'Room',
        'maintenance.tenant': 'Tenant',
        'maintenance.category': 'Category',
        'maintenance.priority': 'Priority',
        'maintenance.description': 'Description',
        'maintenance.notes': 'Additional Notes',
        'maintenance.submit': 'Submit',
        'maintenance.submitting': 'Submitting...',
        'maintenance.filters': 'Filters',
        'maintenance.allStatuses': 'All Statuses',
        'maintenance.allCategories': 'All Categories',
        'maintenance.allPriorities': 'All Priorities',
        'maintenance.requestDetails': 'Maintenance Request Details',
        'maintenance.requestId': 'Request ID',
        'maintenance.status': 'Status',
        'maintenance.submittedDate': 'Submitted Date',
        'maintenance.assignedTo': 'Assigned To',
        'maintenance.scheduledDate': 'Scheduled Date',
        'maintenance.completedDate': 'Completed Date',
        'maintenance.updateRequest': 'Update Request',
        'maintenance.noChange': 'No Change',
        'maintenance.requestHistory': 'Request History',
        'maintenance.noUpdates': 'No updates found',
        'maintenance.updatedBy': 'Updated by',
        'maintenance.view': 'View',
        'maintenance.notAssigned': 'Not assigned',
        'maintenance.notScheduled': 'Not scheduled',
        'maintenance.notCompleted': 'Not completed',
        'maintenance.unknown': 'Unknown',
    },
    kk: {
        // Common
        'login': 'Кіру',
        'logout': 'Шығу',
        'language': 'Тіл',
        'english': 'Ағылшын',
        'kazakh': 'Қазақ',
        
        // Navigation
        'nav.blocks': 'Блоктар',
        'nav.rooms': 'Бөлмелер',
        'nav.tenants': 'Тұрғындар',
        'nav.maintenance': 'Жөндеу',
        'nav.utilityBilling': 'Коммуналдық төлемдер',
        'nav.reports': 'Есептер',

        // Buildings Page
        'buildings.title': 'Блоктар',
        'buildings.sortBy': 'Сұрыптау:',
        'buildings.buildingNumber': 'Ғимарат нөмірі',
        'buildings.occupancyHighest': 'Толымдылық (Жоғары)',
        'buildings.totalRoomsHighest': 'Бөлмелер саны (Жоғары)',
        'buildings.loading': 'Блоктар жүктелуде...',
        'buildings.noData': 'Блоктар табылмады.',
        'buildings.error': 'Блок мәліметтерін жүктеу қатесі',
        'buildings.floors': 'Қабаттар',
        'buildings.totalRooms': 'Барлық бөлмелер',
        'buildings.occupied': 'Бос емес',
        'buildings.occupancy': 'Толымдылық',

        // Rooms Page
        'rooms.title': 'Бөлмелер',
        'rooms.loading': 'Бөлмелер жүктелуде...',
        'rooms.error.fetch': 'Бөлме мәліметтерін жүктеу қатесі',
        'rooms.error.filters': 'Сүзгі параметрлерін жүктеу мүмкін емес.',
        'rooms.filters.building': 'Ғимарат',
        'rooms.filters.status': 'Күйі',
        'rooms.filters.bedrooms': 'Жатын бөлмелер',
        'rooms.filters.all': 'Барлығы',
        'rooms.status.available': 'Бос',
        'rooms.status.occupied': 'Бос емес',
        'rooms.status.maintenance': 'Жөндеуде',
        'rooms.table.number': 'Бөлме нөмірі',
        'rooms.table.building': 'Ғимарат',
        'rooms.table.type': 'Түрі',
        'rooms.table.bedrooms': 'Жатын бөлмелер',
        'rooms.table.status': 'Күйі',
        'rooms.table.tenant': 'Тұрғын',
        'rooms.table.actions': 'Әрекеттер',
        'rooms.table.noData': 'Бөлмелер табылмады',
        
        // Maintenance
        'maintenance.management': 'Жөндеу Басқаруы',
        'maintenance.newRequest': 'Жаңа Жөндеу Сұрауы',
        'maintenance.cancel': 'Болдырмау',
        'maintenance.room': 'Бөлме',
        'maintenance.tenant': 'Тұрғын',
        'maintenance.category': 'Санат',
        'maintenance.priority': 'Басымдық',
        'maintenance.description': 'Сипаттама',
        'maintenance.notes': 'Қосымша ескертулер',
        'maintenance.submit': 'Жіберу',
        'maintenance.submitting': 'Жіберілуде...',
        'maintenance.filters': 'Сүзгілер',
        'maintenance.allStatuses': 'Барлық Статустар',
        'maintenance.allCategories': 'Барлық Санаттар',
        'maintenance.allPriorities': 'Барлық Басымдықтар',
        'maintenance.requestDetails': 'Жөндеу Сұрауының Толық Ақпараты',
        'maintenance.requestId': 'Сұрау ID',
        'maintenance.status': 'Статус',
        'maintenance.submittedDate': 'Жіберілген Күні',
        'maintenance.assignedTo': 'Тапсырылған',
        'maintenance.scheduledDate': 'Жоспарланған Күні',
        'maintenance.completedDate': 'Аяқталған Күні',
        'maintenance.updateRequest': 'Сұрауды Жаңарту',
        'maintenance.noChange': 'Өзгеріс жоқ',
        'maintenance.requestHistory': 'Сұрау Тарихы',
        'maintenance.noUpdates': 'Жаңартулар табылмады',
        'maintenance.updatedBy': 'Жаңартқан',
        'maintenance.view': 'Қарау',
        'maintenance.notAssigned': 'Тапсырылмаған',
        'maintenance.notScheduled': 'Жоспарланбаған',
        'maintenance.notCompleted': 'Аяқталмаған',
        'maintenance.unknown': 'Белгісіз',
    },
    ru: {
        'login': 'Войти',
        'logout': 'Выйти',
        'language': 'Язык',
        'english': 'Английский',
        'kazakh': 'Казахский',
    
        // Navigation
        'nav.blocks': 'Блоки',
        'nav.rooms': 'Комнаты',
        'nav.tenants': 'Жильцы',
        'nav.maintenance': 'Обслуживание',
        'nav.utilityBilling': 'Коммунальные счета',
        'nav.reports': 'Отчеты',
    
        // Buildings Page
        'buildings.title': 'Блоки',
        'buildings.sortBy': 'Сортировать по:',
        'buildings.buildingNumber': 'Номер здания',
        'buildings.occupancyHighest': 'Заполняемость (Наибольшая)',
        'buildings.totalRoomsHighest': 'Всего комнат (Наибольшее)',
        'buildings.loading': 'Загрузка блоков...',
        'buildings.noData': 'Блоки не найдены.',
        'buildings.error': 'Ошибка загрузки данных блока',
        'buildings.floors': 'Этажи',
        'buildings.totalRooms': 'Всего комнат',
        'buildings.occupied': 'Занято',
        'buildings.occupancy': 'Заполняемость',
    
        // Rooms Page
        'rooms.title': 'Комнаты',
        'rooms.loading': 'Загрузка комнат...',
        'rooms.error.fetch': 'Ошибка загрузки комнат',
        'rooms.error.filters': 'Ошибка загрузки фильтров.',
        'rooms.filters.building': 'Здание',
        'rooms.filters.status': 'Статус',
        'rooms.filters.bedrooms': 'Спальни',
        'rooms.filters.all': 'Все',
        'rooms.status.available': 'Свободно',
        'rooms.status.occupied': 'Занято',
        'rooms.status.maintenance': 'На обслуживании',
        'rooms.table.number': 'Номер комнаты',
        'rooms.table.building': 'Здание',
        'rooms.table.type': 'Тип',
        'rooms.table.bedrooms': 'Спальни',
        'rooms.table.status': 'Статус',
        'rooms.table.tenant': 'Жилец',
        'rooms.table.actions': 'Действия',
        'rooms.table.noData': 'Комнаты не найдены',
    
        // Maintenance
        'maintenance.management': 'Управление обслуживанием',
        'maintenance.newRequest': 'Новый запрос на обслуживание',
        'maintenance.cancel': 'Отмена',
        'maintenance.room': 'Комната',
        'maintenance.tenant': 'Жилец',
        'maintenance.category': 'Категория',
        'maintenance.priority': 'Приоритет',
        'maintenance.description': 'Описание',
        'maintenance.notes': 'Дополнительные примечания',
        'maintenance.submit': 'Отправить',
        'maintenance.submitting': 'Отправка...',
        'maintenance.filters': 'Фильтры',
        'maintenance.allStatuses': 'Все статусы',
        'maintenance.allCategories': 'Все категории',
        'maintenance.allPriorities': 'Все приоритеты',
        'maintenance.requestDetails': 'Детали запроса',
        'maintenance.requestId': 'ID запроса',
        'maintenance.status': 'Статус',
        'maintenance.submittedDate': 'Дата подачи',
        'maintenance.assignedTo': 'Назначено',
        'maintenance.scheduledDate': 'Плановая дата',
        'maintenance.completedDate': 'Дата завершения',
        'maintenance.updateRequest': 'Обновить запрос',
        'maintenance.noChange': 'Без изменений',
        'maintenance.requestHistory': 'История запроса',
        'maintenance.noUpdates': 'Нет обновлений',
        'maintenance.updatedBy': 'Обновил',
        'maintenance.view': 'Просмотр',
        'maintenance.notAssigned': 'Не назначено',
        'maintenance.notScheduled': 'Не запланировано',
        'maintenance.notCompleted': 'Не завершено',
        'maintenance.unknown': 'Неизвестно',
    }
    
};

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [language, setLanguage] = useState<Language>('en');

    const t = (key: TranslationKey): string => {
        return translations[language][key] || key;
    };

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
}; 