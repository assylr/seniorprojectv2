import React, { useEffect, useMemo } from 'react';
import { useForm, SubmitHandler, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Tenant, TenantFormData, Building, Room } from '@/types'; // Ensure Room type includes isAvailable
import { tenantFormSchema } from '../../../services/validation';
import styles from './TenantForm.module.css';


interface TenantFormProps {
    onSubmit: (data: TenantFormData) => Promise<void>; // Or just Promise<Tenant> if API returns it
    onCancel: () => void;
    initialData?: Tenant | null;
    isSubmitting: boolean;
    buildings: Building[];
    rooms: Room[];
}

const TenantForm: React.FC<TenantFormProps> = ({
    onSubmit,
    onCancel,
    initialData = null,
    isSubmitting,
    buildings,
    rooms,
}) => {
    // Helper to find initial building ID
    const getInitialBuildingId = (tenant: Tenant | null, allRooms: Room[]): string => {
        if (tenant?.currentRoomId) {
            const room = allRooms.find(r => r.id === tenant.currentRoomId);
            return room?.buildingId?.toString() || '';
        }
        return '';
    };

    const { register, handleSubmit, control, formState: { errors }, reset, watch, setValue } = useForm<TenantFormData>({
        resolver: zodResolver(tenantFormSchema) as any,
        // Set default values dynamically based on initialData
        defaultValues: useMemo(() => {
            const initialBuildingId = getInitialBuildingId(initialData, rooms);
            return initialData ? {
                name: initialData.surname,
                surname: initialData.name,
                schoolOrDepartment: initialData.schoolOrDepartment ?? '', // Ensure nulls become empty strings if needed by input
                position: initialData.position ?? '',
                tenantType: initialData.tenantType,
                mobile: initialData.mobile ?? '',
                email: initialData.email ?? '',
                arrivalDate: initialData.arrivalDate ? new Date(initialData.arrivalDate).toISOString().split('T')[0] : '',
                expectedDepartureDate: initialData.expectedDepartureDate ? new Date(initialData.expectedDepartureDate).toISOString().split('T')[0] : '',
                buildingId: initialBuildingId, // Use a dedicated field for building selection
                roomId: initialData.currentRoomId ?? null, // RHF handles null/undefined for selects
            } : {
                // Defaults for create mode
                name: '', surname: '', schoolOrDepartment: '', position: '',
                tenantType: undefined, mobile: '', email: '',
                arrivalDate: '', expectedDepartureDate: '',
                buildingId: null, // Default building to empty
                roomId: null,
            };
        }, [initialData, rooms]) // Recalculate defaults if initialData or rooms change
    });

    // Watch the selected building ID directly from the form state
    const watchedBuildingId = watch('buildingId');

    // Filter available rooms based on the watched building ID
    const availableRoomsForSelectedBuilding = useMemo(() => {
        if (!watchedBuildingId) return [];
        const buildingIdNum = 10
        return rooms.filter(room =>
            room.buildingId === buildingIdNum &&
            (room.isAvailable || room.id === initialData?.currentRoomId) // Room is available OR it's the tenant's current room
        );
    }, [watchedBuildingId, rooms, initialData?.currentRoomId]);

    // Effect to reset room selection when building changes
    useEffect(() => {
        // Don't reset if it's the initial render with pre-selected values matching
        if (watch('buildingId') !== getInitialBuildingId(initialData, rooms)) {
             // Check if the current room ID is still valid for the new building
             const currentRoomId = watch('roomId');
             const roomIsValidInNewBuilding = availableRoomsForSelectedBuilding.some(r => r.id === currentRoomId);

             if (!roomIsValidInNewBuilding) {
                 setValue('roomId', null); // Reset room if building changes and current room is no longer valid/available
             }
        }
        // This effect primarily handles user interaction changing the building
    }, [watchedBuildingId, setValue, initialData, rooms, watch, availableRoomsForSelectedBuilding]); // Add necessary dependencies


    // Reset form completely if initialData itself changes (e.g., switching from create to edit)
    useEffect(() => {
        const initialBuildingId = getInitialBuildingId(initialData, rooms);
        reset({
            // Use the same logic as defaultValues Memo
            ...(initialData ? {
                name: initialData.name, surname: initialData.surname, schoolOrDepartment: initialData.schoolOrDepartment ?? '',
                position: initialData.position ?? '', tenantType: initialData.tenantType, mobile: initialData.mobile ?? '', email: initialData.email ?? '',
                arrivalDate: initialData.arrivalDate ? new Date(initialData.arrivalDate).toISOString().split('T')[0] : '',
                expectedDepartureDate: initialData.expectedDepartureDate ? new Date(initialData.expectedDepartureDate).toISOString().split('T')[0] : '',
                buildingId: initialBuildingId, roomId: initialData.currentRoomId ?? null,
            } : {
                 name: '', surname: '', schoolOrDepartment: '', position: '', tenantType: undefined, mobile: '', email: '',
                 arrivalDate: '', expectedDepartureDate: '', buildingId: null, roomId: null,
            })
        });
    }, [initialData, reset, rooms]); // Dependency on initialData and potentially rooms


    // Submit handler remains the same conceptually
    const handleFormSubmit: SubmitHandler<TenantFormData> = (data) => {
        // buildingId is now a real field, no need to remove temporary one
        onSubmit(data);
    };

    return (
        <form onSubmit={handleSubmit(handleFormSubmit)} className={styles.tenantForm}>
            <div className={styles.formGrid}>
                {/* Tenant Details (Fields remain mostly the same, ensure 'name' matches RHF register) */}
                 <div className={styles.formGroup}>
                    <label htmlFor="name">First Name *</label>
                    <input id="name" {...register('name')} disabled={isSubmitting} aria-invalid={errors.name ? "true" : "false"}/>
                    {errors.name && <p role="alert" className={styles.errorMessage}>{errors.name.message}</p>}
                </div>
                 <div className={styles.formGroup}>
                    <label htmlFor="surname">Last Name *</label>
                    <input id="surname" {...register('surname')} disabled={isSubmitting} aria-invalid={errors.surname ? "true" : "false"}/>
                    {errors.surname && <p role="alert" className={styles.errorMessage}>{errors.surname.message}</p>}
                </div>
                 <div className={styles.formGroup}>
                    <label htmlFor="tenantType">Type *</label>
                    <select id="tenantType" {...register('tenantType')} disabled={isSubmitting} aria-invalid={errors.tenantType ? "true" : "false"}>
                        <option value="">-- Select Type --</option>
                        <option value="faculty">Faculty</option>
                        <option value="staff">Staff</option>
                        {/* Add other types */}
                    </select>
                    {errors.tenantType && <p role="alert" className={styles.errorMessage}>{errors.tenantType.message}</p>}
                </div>
                <div className={styles.formGroup}>
                    <label htmlFor="email">Email</label>
                    <input id="email" type="email" {...register('email')} disabled={isSubmitting} aria-invalid={errors.email ? "true" : "false"}/>
                    {errors.email && <p role="alert" className={styles.errorMessage}>{errors.email.message}</p>}
                </div>
                 <div className={styles.formGroup}>
                    <label htmlFor="mobile">Mobile</label>
                    <input id="mobile" type="tel" {...register('mobile')} disabled={isSubmitting} aria-invalid={errors.mobile ? "true" : "false"}/>
                    {errors.mobile && <p role="alert" className={styles.errorMessage}>{errors.mobile.message}</p>}
                </div>
                <div className={styles.formGroup}>
                    <label htmlFor="schoolOrDepartment">School / Department</label>
                    <input id="schoolOrDepartment" {...register('schoolOrDepartment')} disabled={isSubmitting} />
                </div>
                <div className={styles.formGroup}>
                    <label htmlFor="position">Position</label>
                    <input id="position" {...register('position')} disabled={isSubmitting} />
                </div>
                 <div className={styles.formGroup}>
                    <label htmlFor="arrivalDate">Arrival Date</label>
                    <input id="arrivalDate" type="date" {...register('arrivalDate')} disabled={isSubmitting} aria-invalid={errors.arrivalDate ? "true" : "false"}/>
                     {errors.arrivalDate && <p role="alert" className={styles.errorMessage}>{errors.arrivalDate.message}</p>}
                </div>
                 <div className={styles.formGroup}>
                    <label htmlFor="expectedDepartureDate">Expected Departure</label>
                    <input id="expectedDepartureDate" type="date" {...register('expectedDepartureDate')} disabled={isSubmitting} aria-invalid={errors.expectedDepartureDate ? "true" : "false"}/>
                     {errors.expectedDepartureDate && <p role="alert" className={styles.errorMessage}>{errors.expectedDepartureDate.message}</p>}
                 </div>

                 {/* --- Room Assignment --- */}
                <div className={`${styles.formGroup} ${styles.spanFull}`}>
                    <hr className={styles.divider} />
                    <h3 className={styles.subheading}>Room Assignment</h3>
                 </div>

                 {/* Building Selection (Now a required part of the form data) */}
                 <div className={styles.formGroup}>
                    <label htmlFor="buildingId">Building</label>
                     {/* Register the actual buildingId field */}
                    <select
                        id="buildingId"
                        {...register('buildingId')} // Register the field
                        disabled={isSubmitting}
                        aria-invalid={errors.buildingId ? "true" : "false"} // Add validation if needed
                    >
                        <option value="">-- Select Building --</option>
                        {buildings.map(building => (
                            <option key={building.id} value={building.id.toString()}>
                                {building.buildingNumber || `ID: ${building.id}`}
                            </option>
                        ))}
                    </select>
                    {/* Add error display if building becomes required */}
                    {/* {errors.buildingId && <p role="alert" className={styles.errorMessage}>{errors.buildingId.message}</p>} */}
                 </div>

                {/* Room Selection (Depends on watchedBuildingId) */}
                <div className={styles.formGroup}>
                    {/* Controller might be slightly cleaner for dependent fields if register causes issues */}
                     <Controller
                        name="roomId"
                        control={control}
                        render={({ field }) => (
                             <>
                                 <label htmlFor="roomId">Room</label>
                                <select
                                    id="roomId"
                                    {...field}
                                    value={field.value ?? ''} // Handle null/undefined for select value
                                    onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value, 10) : null)} // Ensure value is number or null
                                    disabled={isSubmitting || !watchedBuildingId || availableRoomsForSelectedBuilding.length === 0}
                                    aria-invalid={errors.roomId ? "true" : "false"}
                                >
                                    <option value="">
                                        {!watchedBuildingId ? '-- Select Building First --' : (availableRoomsForSelectedBuilding.length === 0 ? '-- No Available Rooms --' : '-- Select Room --')}
                                    </option>
                                    {availableRoomsForSelectedBuilding.map(room => (
                                        <option key={room.id} value={room.id}>
                                            Room {room.roomNumber} ({room.bedroomCount} Bed)
                                            {/* Optionally show if it's the current room */}
                                            {/* {room.id === initialData?.currentRoomId ? ' (Current)' : ''} */}
                                        </option>
                                    ))}
                                </select>
                             </>
                         )}
                     />
                    {errors.roomId && <p role="alert" className={styles.errorMessage}>{errors.roomId.message}</p>}
                </div>
            </div>

            {/* Form Actions */}
            <div className={styles.formActions}>
                <button type="button" onClick={onCancel} className={styles.cancelButton} disabled={isSubmitting}>
                    Cancel
                </button>
                <button type="submit" className={styles.submitButton} disabled={isSubmitting}>
                    {isSubmitting ? 'Saving...' : (initialData ? 'Update Tenant' : 'Create & Check In')}
                </button>
            </div>
        </form>
    );
};

export default TenantForm;