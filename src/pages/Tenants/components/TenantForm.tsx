// src/pages/Tenants/components/TenantForm.tsx
import React, { useEffect, useMemo } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { TenantDetailDTO, TenantFormData, Room, TenantType, Building } from '@/types';
import styles from './TenantForm.module.css';


interface TenantFormProps {
    onSubmit: (data: TenantFormData) => Promise<void>;
    onCancel: () => void;
    initialData?: TenantDetailDTO | null;
    isSubmitting: boolean;
    buildings: Building[];
    rooms: Room[];
}

type FormState = {
    name: string;
    surname: string;
    mobile: string;
    email: string;
    school: string | null;
    position: string | null;
    tenantType: TenantType;
    buildingId: number | null;
    roomId: number;
    arrivalDate: string | null;
    departureDate: string | null;
    visitingGuests: string | null;
    deposit: number | null;
};

const TenantForm: React.FC<TenantFormProps> = ({
    onSubmit,
    onCancel,
    initialData = null,
    buildings,
    rooms,
}) => {
    const defaultValues = useMemo(() => ({
        name: '',
        surname: '',
        mobile: '',
        email: '',
        school: null,
        position: null,
        tenantType: TenantType.FACULTY,
        buildingId: null,
        roomId: 0,
        arrivalDate: null,
        departureDate: null,
        visitingGuests: null,
        deposit: null,
    }), []);

    const {
        register,
        handleSubmit,
        control,
        formState: { errors, isSubmitting: formIsSubmitting },
        reset,
        watch,
    } = useForm<FormState>({
        defaultValues,
    });

    const selectedBuildingId = watch('buildingId');
    const selectedRoomId = watch('roomId');

    // Filter available rooms based on selected building
    const availableRooms = useMemo(() => {
        return rooms.filter(room => 
            room.status === 'AVAILABLE' && 
            (!selectedBuildingId || room.buildingId === selectedBuildingId)
        );
    }, [rooms, selectedBuildingId]);

    // Reset room selection when building changes
    useEffect(() => {
        if (selectedBuildingId) {
            const currentRoom = rooms.find(r => r.id === selectedRoomId);
            if (!currentRoom || currentRoom.buildingId !== selectedBuildingId) {
                reset({ ...watch(), roomId: 0 });
            }
        }
    }, [selectedBuildingId, selectedRoomId, rooms, reset, watch]);

    useEffect(() => {
        reset(defaultValues);
    }, [reset, defaultValues]);

    const handleFormSubmit = (formData: FormState) => {
        console.log("Internal Form State Submitted:", formData);

        const dataToSubmit: TenantFormData = {
            ...formData,
            // Ensure roomId is a number
            roomId: Number(formData.roomId),
            // Ensure buildingId is a number or null
            buildingId: formData.buildingId ? Number(formData.buildingId) : null,
            // Ensure deposit is a number or null
            deposit: formData.deposit ? Number(formData.deposit) : null,
        };

        console.log("Data Prepared for API (TenantFormData):", dataToSubmit);
        onSubmit(dataToSubmit);
    };

    return (
        <form onSubmit={handleSubmit(handleFormSubmit)} className={styles.tenantForm}>
            <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                    <label htmlFor="name">First Name</label>
                    <input id="name" {...register('name')} disabled={formIsSubmitting} />
                    {errors.name && <p className={styles.errorMessage}>{errors.name.message}</p>}
                </div>
                <div className={styles.formGroup}>
                    <label htmlFor="surname">Last Name</label>
                    <input id="surname" {...register('surname')} disabled={formIsSubmitting} />
                    {errors.surname && <p className={styles.errorMessage}>{errors.surname.message}</p>}
                </div>
                <div className={styles.formGroup}>
                    <label htmlFor="tenantType">Type</label>
                    <select id="tenantType" {...register('tenantType')} disabled={formIsSubmitting}>
                        <option value="">Select Type</option>
                        <option value="FACULTY">Faculty</option>
                        <option value="RENTER">Renter</option>
                    </select>
                    {errors.tenantType && <p className={styles.errorMessage}>{errors.tenantType.message}</p>}
                </div>
                <div className={styles.formGroup}>
                    <label htmlFor="email">Email</label>
                    <input id="email" type="email" {...register('email')} disabled={formIsSubmitting} />
                    {errors.email && <p className={styles.errorMessage}>{errors.email.message}</p>}
                </div>
                <div className={styles.formGroup}>
                    <label htmlFor="mobile">Mobile</label>
                    <input id="mobile" type="tel" {...register('mobile')} disabled={formIsSubmitting} />
                    {errors.mobile && <p className={styles.errorMessage}>{errors.mobile.message}</p>}
                </div>
                <div className={styles.formGroup}>
                    <label htmlFor="school">School / Dept</label>
                    <input id="school" {...register('school')} disabled={formIsSubmitting} />
                    {errors.school && <p className={styles.errorMessage}>{errors.school.message}</p>}
                </div>
                <div className={styles.formGroup}>
                    <label htmlFor="position">Position</label>
                    <input id="position" {...register('position')} disabled={formIsSubmitting} />
                    {errors.position && <p className={styles.errorMessage}>{errors.position.message}</p>}
                </div>
                <div className={styles.formGroup}>
                    <label htmlFor="arrivalDate">Arrival Date</label>
                    <input id="arrivalDate" type="date" {...register('arrivalDate')} disabled={formIsSubmitting} />
                    {errors.arrivalDate && <p className={styles.errorMessage}>{errors.arrivalDate.message}</p>}
                </div>
                <div className={styles.formGroup}>
                    <label htmlFor="departureDate">Expected Departure</label>
                    <input id="departureDate" type="date" {...register('departureDate')} disabled={formIsSubmitting} />
                    {errors.departureDate && <p className={styles.errorMessage}>{errors.departureDate.message}</p>}
                </div>

                <div className={styles.formGroup}>
                    <label htmlFor="deposit">Deposit</label>
                    <input 
                        id="deposit" 
                        type="number" 
                        min="0" 
                        step="0.01" 
                        {...register('deposit')} 
                        disabled={formIsSubmitting} 
                    />
                    {errors.deposit && <p className={styles.errorMessage}>{errors.deposit.message}</p>}
                </div>

                <div className={styles.formGroup}>
                    <label htmlFor="visitingGuests">Visiting Guests</label>
                    <textarea 
                        id="visitingGuests" 
                        {...register('visitingGuests')} 
                        disabled={formIsSubmitting}
                        placeholder="Enter details about visiting guests (optional)"
                        rows={3}
                    />
                    {errors.visitingGuests && <p className={styles.errorMessage}>{errors.visitingGuests.message}</p>}
                </div>

                <div className={`${styles.formGroup} ${styles.spanFull}`}>
                    <hr className={styles.divider} />
                    <h3 className={styles.subheading}>Building Assignment</h3>
                </div>

                <div className={styles.formGroup}>
                    <label htmlFor="buildingId">Building *</label>
                    <Controller
                        name="buildingId"
                        control={control}
                        render={({ field }) => (
                            <select
                                {...field}
                                value={field.value ?? ''}
                                onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : null)}
                                disabled={formIsSubmitting}
                            >
                                <option value="">Select Building</option>
                                {buildings.map(building => (
                                    <option key={building.id} value={building.id}>
                                        {building.buildingNumber}
                                    </option>
                                ))}
                            </select>
                        )}
                    />
                    {errors.buildingId && <p className={styles.errorMessage}>{errors.buildingId.message}</p>}
                </div>

                <div className={`${styles.formGroup} ${styles.spanFull}`}>
                    <hr className={styles.divider} />
                    <h3 className={styles.subheading}>Room Assignment</h3>
                </div>

                <div className={styles.formGroup}>
                    <label htmlFor="roomId">Room *</label>
                    <Controller
                        name="roomId"
                        control={control}
                        render={({ field }) => (
                            <select
                                {...field}
                                value={field.value ?? ''}
                                onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : 0)}
                                disabled={formIsSubmitting || !selectedBuildingId || availableRooms.length === 0}
                            >
                                <option value="">Select Room</option>
                                {availableRooms.map(room => (
                                    <option key={room.id} value={room.id}>
                                        {room.roomNumber}
                                    </option>
                                ))}
                            </select>
                        )}
                    />
                    {errors.roomId && <p className={styles.errorMessage}>{errors.roomId.message}</p>}
                </div>
            </div>

            <div className={styles.formActions}>
                <button type="button" onClick={onCancel} className={styles.cancelButton} disabled={formIsSubmitting}>
                    Cancel
                </button>
                <button type="submit" className={styles.submitButton} disabled={formIsSubmitting}>
                    {formIsSubmitting ? 'Saving...' : (initialData ? 'Update Tenant' : 'Create & Check In')}
                </button>
            </div>
        </form>
    );
};

export default TenantForm;