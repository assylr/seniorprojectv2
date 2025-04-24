// src/pages/Tenants/components/TenantForm.tsx
import React, { useEffect, useMemo } from 'react';
import { useForm, SubmitHandler, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
// Import the specific types provided
import { TenantDetailDTO, TenantFormData, Building, Room, TenantType } from '@/types'; // Adjust path
// Assume schema is adapted to validate the fields BELOW in FormState that map to TenantFormData
import { tenantFormSchema } from '@/services/validation'; // Adjust path
import styles from './TenantForm.module.css';

interface TenantFormProps {
    onSubmit: (data: TenantFormData) => Promise<void>; // Expects TenantFormData structure
    onCancel: () => void;
    initialData?: TenantDetailDTO | null; // DTO for pre-filling
    isSubmitting: boolean;
    buildings: Building[];
    rooms: Room[]; // Needs Room[] with status
}

// Define the internal state structure for THIS form
// Includes fields from TenantFormData + extras needed for UI (buildingId)
type FormState = {
    name: string;
    surname: string;
    school: string | null;
    position: string | null;
    tenantType: TenantType | undefined;
    mobile: string; // Needed by form, even if missing in DTO
    email: string;  // Needed by form, even if missing in DTO
    // familyMembers: FamilyMember | null; // Assuming not handled in this specific form version
    checkInDate: string | null; // Renamed from arrivalDate for consistency
    expectedDepartureDate: string | null;
    roomId: number;
    // --- Extra fields needed ONLY for form logic/UI ---
    buildingId: string | null; // For the building dropdown state (string)
};

// Helper functions
const toStringOrEmpty = (value: unknown): string => (value != null ? String(value) : '');
const formatDateForInput = (dateString: string | null | undefined): string => {
    if (!dateString) return '';
    try { return new Date(dateString).toISOString().split('T')[0]; }
    catch (e) { console.error("Error formatting date:", dateString, e); return ''; }
};

const TenantForm: React.FC<TenantFormProps> = ({
    onSubmit,
    onCancel,
    initialData = null, // This is TenantDetailDTO
    isSubmitting,
    buildings,
    rooms,
}) => {

    const { register, handleSubmit, control, formState: { errors }, reset, watch, setValue } = useForm<FormState>({
        // IMPORTANT: Zod schema should validate the fields corresponding to FormState
        // that eventually map to TenantFormData. It might need adjustments.
        resolver: zodResolver(tenantFormSchema),
        defaultValues: useMemo(() => {
            // Always initialize with the full FormState structure
            const defaults: FormState = {
                name: '', surname: '', school: null, position: null,
                tenantType: undefined, mobile: '', email: '',
                checkInDate: null, expectedDepartureDate: null,
                roomId: null, buildingId: null,
            };

            if (initialData) { // If initialData (TenantDetailDTO) is provided
                defaults.name = initialData.name ?? '';
                defaults.surname = initialData.surname ?? '';
                defaults.school = initialData.school ?? null;
                defaults.position = initialData.position ?? null;
                defaults.tenantType = initialData.tenantType;
                // mobile & email are NOT in TenantDetailDTO as provided, so they remain empty
                defaults.checkInDate = formatDateForInput(initialData.checkInDate);
                defaults.expectedDepartureDate = formatDateForInput(initialData.expectedDepartureDate);
                defaults.roomId = initialData.roomId ?? null;
                defaults.buildingId = toStringOrEmpty(initialData.buildingId);
            }
            return defaults;
        }, [initialData])
    });

    const watchedBuildingId = watch('buildingId'); // string | null

    const availableRoomsForSelectedBuilding = useMemo(() => {
        if (!watchedBuildingId) return [];
        const buildingIdNum = parseInt(watchedBuildingId, 10);
        if (isNaN(buildingIdNum)) return [];
        // Assumes Room type has 'status' field
        return rooms.filter(room =>
            room.buildingId === buildingIdNum &&
            (room.id === initialData?.roomId || room.status === 'AVAILABLE')
        );
    }, [watchedBuildingId, rooms, initialData?.roomId]);

    // Effect to reset room when building changes
    useEffect(() => {
        const currentFormBuildingId = watch('buildingId');
        const initialDtoBuildingId = toStringOrEmpty(initialData?.buildingId);

        if (initialData === null || currentFormBuildingId !== initialDtoBuildingId) {
            const currentRoomId = watch('roomId');
            const roomIsValidInNewBuilding = availableRoomsForSelectedBuilding.some(r => r.id === currentRoomId);
            if (!roomIsValidInNewBuilding && currentRoomId !== null) {
                setValue('roomId', null, { shouldValidate: true });
            }
        }
    }, [watchedBuildingId, setValue, initialData, watch, availableRoomsForSelectedBuilding]);

    // Effect to reset form fully when initialData changes
    useEffect(() => {
        // Recalculate defaults using the same logic as useMemo
        const defaults: FormState = {
            name: '', surname: '', school: null, position: null,
            tenantType: undefined, mobile: '', email: '',
            checkInDate: null, expectedDepartureDate: null,
            roomId: null, buildingId: null,
        };
        if (initialData) {
            defaults.name = initialData.name ?? '';
            defaults.surname = initialData.surname ?? '';
            defaults.school = initialData.school ?? null;
            defaults.position = initialData.position ?? null;
            defaults.tenantType = initialData.tenantType;
            defaults.checkInDate = formatDateForInput(initialData.checkInDate);
            defaults.expectedDepartureDate = formatDateForInput(initialData.expectedDepartureDate);
            defaults.roomId = initialData.roomId ?? null;
            defaults.buildingId = toStringOrEmpty(initialData.buildingId);
        }
        reset(defaults);
    }, [initialData, reset]);


    // Handle submission: Convert FormState -> TenantFormData
    // Correct: SubmitHandler explicitly uses the FormState type
const handleFormSubmit: SubmitHandler<FormState> = (formData: FormState) => {
    console.log("Internal Form State Submitted:", formData);

    // Create the object matching the TenantFormData structure
    const dataToSubmit: TenantFormData = {
        name: formData.name,
        surname: formData.surname,
        school: formData.school || null,
        position: formData.position || null,
        tenantType: formData.tenantType as TenantType, // Add assertion or proper handling
        mobile: formData.mobile,
        email: formData.email,
        familyMembers: null, // Assuming null for now based on TenantFormData
        checkInDate: formData.checkInDate || null,
        expectedDepartureDate: formData.expectedDepartureDate || null,
        roomId: formData.roomId,
    };

    console.log("Data Prepared for API (TenantFormData):", dataToSubmit);
    onSubmit(dataToSubmit); // Send the correctly structured data
};
    return (
        <form onSubmit={handleSubmit(handleFormSubmit)} className={styles.tenantForm}>
            <div className={styles.formGrid}>
                {/* --- Tenant Details --- */}
                {/* Use register names matching FormState */}
                <div className={styles.formGroup}>
                    <label htmlFor="name">First Name *</label>
                    <input id="name" {...register('name')} disabled={isSubmitting} />
                    {errors.name && <p className={styles.errorMessage}>{errors.name.message}</p>}
                </div>
                <div className={styles.formGroup}>
                    <label htmlFor="surname">Last Name *</label>
                    <input id="surname" {...register('surname')} disabled={isSubmitting} />
                    {errors.surname && <p className={styles.errorMessage}>{errors.surname.message}</p>}
                </div>
                <div className={styles.formGroup}>
                    <label htmlFor="tenantType">Type *</label>
                    <select id="tenantType" {...register('tenantType')} disabled={isSubmitting}>
                        <option value="">Select Type</option>
                        <option value="FACULTY">Faculty</option>
                        <option value="STAFF">Staff</option>
                        <option value="RENTOR">Renter</option>
                    </select>
                    {errors.tenantType && <p className={styles.errorMessage}>{errors.tenantType.message}</p>}
                </div>
                <div className={styles.formGroup}>
                    <label htmlFor="email">Email</label>
                    <input id="email" type="email" {...register('email')} disabled={isSubmitting} />
                    {errors.email && <p className={styles.errorMessage}>{errors.email.message}</p>}
                </div>
                <div className={styles.formGroup}>
                    <label htmlFor="mobile">Mobile</label>
                    <input id="mobile" type="tel" {...register('mobile')} disabled={isSubmitting} />
                    {errors.mobile && <p className={styles.errorMessage}>{errors.mobile.message}</p>}
                </div>
                <div className={styles.formGroup}>
                    <label htmlFor="school">School / Dept</label>
                    <input id="school" {...register('school')} disabled={isSubmitting} />
                    {/* Add error if needed */}
                </div>
                <div className={styles.formGroup}>
                    <label htmlFor="position">Position</label>
                    <input id="position" {...register('position')} disabled={isSubmitting} />
                    {/* Add error if needed */}
                </div>
                <div className={styles.formGroup}>
                    <label htmlFor="checkInDate">Arrival Date</label> {/* Label might differ */}
                    <input id="checkInDate" type="date" {...register('checkInDate')} disabled={isSubmitting} /> {/* Register name matches FormState/FormData */}
                    {errors.checkInDate && <p className={styles.errorMessage}>{errors.checkInDate.message}</p>}
                </div>
                <div className={styles.formGroup}>
                    <label htmlFor="expectedDepartureDate">Expected Departure</label>
                    <input id="expectedDepartureDate" type="date" {...register('expectedDepartureDate')} disabled={isSubmitting} />
                    {errors.expectedDepartureDate && <p className={styles.errorMessage}>{errors.expectedDepartureDate.message}</p>}
                </div>

                {/* --- Room Assignment Section --- */}
                <div className={`${styles.formGroup} ${styles.spanFull}`}><hr className={styles.divider} /><h3 className={styles.subheading}>Room Assignment</h3></div>

                 {/* Building Selection - register 'buildingId' */}
                <div className={styles.formGroup}>
                    <label htmlFor="buildingId">Building</label>
                    <select id="buildingId" {...register('buildingId')} disabled={isSubmitting}>
                        <option value="">Select Building</option>
                        {buildings.map(b => (
                            <option key={b.id} value={String(b.id)}>
                                {b.buildingNumber}
                            </option>
                        ))}
                    </select>
                     {/* Error display for buildingId if validation requires it */}
                    {/* {errors.buildingId && <p className={styles.errorMessage}>{errors.buildingId.message}</p>} */}
                </div>

                {/* Room Selection - Controller for 'roomId' */}
                <div className={styles.formGroup}>
                    <label htmlFor="roomId">Room</label>
                    <Controller
                        name="roomId"
                        control={control}
                        render={({ field }) => (
                            <select
                                id="roomId"
                                {...field}
                                value={field.value ?? ''}
                                onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value, 10) : null)}
                                disabled={isSubmitting || !watchedBuildingId || availableRoomsForSelectedBuilding.length === 0}
                            >
                                <option value="">
                                    {!watchedBuildingId ? 'Select Building First' : (availableRoomsForSelectedBuilding.length === 0 ? 'No Available Rooms' : 'Select Room')}
                                </option>
                                {availableRoomsForSelectedBuilding.map(room => (
                                    <option key={room.id} value={room.id}>
                                        Room {room.roomNumber} {room.bedroomCount ? `(${room.bedroomCount} Bed)` : ''}
                                    </option>
                                ))}
                            </select>
                         )}
                     />
                    {errors.roomId && <p className={styles.errorMessage}>{errors.roomId.message}</p>}
                </div>
            </div>

            {/* --- Form Actions --- */}
            <div className={styles.formActions}>
                <button type="button" onClick={onCancel} className={styles.cancelButton} disabled={isSubmitting}>Cancel</button>
                <button type="submit" className={styles.submitButton} disabled={isSubmitting}>{isSubmitting ? 'Saving...' : (initialData ? 'Update Tenant' : 'Create & Check In')}</button>
            </div>
        </form>
    );
};

export default TenantForm;