// src/pages/Tenants/components/TenantForm.tsx
import React, { useState, useEffect, useMemo } from 'react'; // Added useState, useMemo
import { useForm, SubmitHandler, Controller, useWatch } from 'react-hook-form'; // Added Controller, useWatch
import { zodResolver } from '@hookform/resolvers/zod';
import { Tenant, TenantFormData, Building, Room } from '../../../services/types'; // Added Building, Room
import { tenantFormSchema } from '../../../services/validation';
import styles from './TenantForm.module.css';

interface TenantFormProps {
    onSubmit: (data: TenantFormData) => Promise<void>;
    onCancel: () => void;
    initialData?: Tenant | null;
    isSubmitting: boolean;
    // Add props for Buildings and Rooms
    buildings: Building[];
    rooms: Room[]; // Pass all rooms, filtering happens here
}

const TenantForm: React.FC<TenantFormProps> = ({
    onSubmit,
    onCancel,
    initialData = null,
    isSubmitting,
    buildings,
    rooms, // Receive all rooms
}) => {

    // Internal state to track the selected building for filtering rooms
    const [selectedBuildingId, setSelectedBuildingId] = useState<string>(() => {
        // Pre-select building if editing and tenant has a room
        if (initialData?.currentRoomId) {
             const room = rooms.find(r => r.id === initialData.currentRoomId);
             return room?.buildingId?.toString() || '';
        }
        return '';
    });

    // Map initialData to TenantFormData, including initial roomId if editing
    const defaultValues: Partial<TenantFormData> = initialData ? {
        // ... other fields
        firstName: initialData.firstName,
        lastName: initialData.lastName,
        schoolOrDepartment: initialData.schoolOrDepartment,
        position: initialData.position,
        tenantType: initialData.tenantType,
        mobile: initialData.mobile,
        email: initialData.email,
        arrivalDate: initialData.arrivalDate ? new Date(initialData.arrivalDate).toISOString().split('T')[0] : null,
        expectedDepartureDate: initialData.expectedDepartureDate ? new Date(initialData.expectedDepartureDate).toISOString().split('T')[0] : null,
        roomId: initialData.currentRoomId, // Use currentRoomId from Tenant
    } : {
        // ... defaults for create mode ...
        firstName: '', lastName: '', schoolOrDepartment: null, position: null,
        tenantType: undefined, mobile: null, email: null,
        arrivalDate: null, expectedDepartureDate: null,
        roomId: null, // Default to no room selected
    };


    const { register, handleSubmit, control, formState: { errors }, reset, setValue, watch } = useForm<TenantFormData>({
        resolver: zodResolver(tenantFormSchema),
        defaultValues: defaultValues,
    });

    // Watch the value of the native building select input
    const watchedBuildingSelect = watch('__buildingSelect'); // Temporary field watch

    // Effect to update internal selectedBuildingId state when RHF value changes
    useEffect(() => {
        setSelectedBuildingId(watchedBuildingSelect || '');
         // If building changes, reset the room selection unless it's the initial load for editing
         if (!initialData || watchedBuildingSelect !== selectedBuildingId) {
             setValue('roomId', null); // Reset room selection using RHF's setValue
         }
    }, [watchedBuildingSelect, setValue, initialData, selectedBuildingId]);


    // Reset form if initialData changes
    useEffect(() => {
        const initialBuildingId = initialData?.currentRoomId ? rooms.find(r => r.id === initialData.currentRoomId)?.buildingId?.toString() || '' : '';
        setSelectedBuildingId(initialBuildingId);
        reset({
            ...defaultValues,
            __buildingSelect: initialBuildingId, // Reset the watched field too
        });
    }, [initialData, reset, rooms]); // Add rooms to dependency


    // Filter available rooms based on the selected building ID
    // Only show rooms marked as available OR the room the tenant currently occupies (for editing)
    const availableRoomsForSelectedBuilding = useMemo(() => {
        if (!selectedBuildingId) {
            return [];
        }
        const buildingIdNum = parseInt(selectedBuildingId, 10);
        return rooms.filter(room =>
            room.buildingId === buildingIdNum &&
            (room.isAvailable || room.id === initialData?.currentRoomId) // Available OR currently assigned to this tenant
        );
    }, [selectedBuildingId, rooms, initialData?.currentRoomId]);


    const handleFormSubmit: SubmitHandler<TenantFormData> = (data) => {
         // Remove the temporary field before submitting
        const { __buildingSelect, ...submitData } = data as any;
        onSubmit(submitData as TenantFormData); // Submit cleaned data
    };

    return (
        <form onSubmit={handleSubmit(handleFormSubmit)} className={styles.tenantForm}>
            <div className={styles.formGrid}>
                {/* --- Tenant Details --- */}
                {/* First Name */}
                <div className={styles.formGroup}>
                    <label htmlFor="firstName">First Name *</label>
                    <input id="firstName" {...register('firstName')} disabled={isSubmitting} />
                    {errors.firstName && <p role="alert" className={styles.errorMessage}>{errors.firstName.message}</p>}
                </div>
                 {/* Last Name */}
                 <div className={styles.formGroup}>
                    <label htmlFor="lastName">Last Name *</label>
                    <input id="lastName" {...register('lastName')} disabled={isSubmitting} />
                    {errors.lastName && <p role="alert" className={styles.errorMessage}>{errors.lastName.message}</p>}
                </div>
                {/* Tenant Type */}
                 <div className={styles.formGroup}>
                    <label htmlFor="tenantType">Type *</label>
                    <select id="tenantType" {...register('tenantType')} disabled={isSubmitting} >
                        <option value="">-- Select Type --</option>
                        <option value="faculty">Faculty</option>
                        <option value="staff">Staff</option>
                    </select>
                    {errors.tenantType && <p role="alert" className={styles.errorMessage}>{errors.tenantType.message}</p>}
                </div>
                {/* Email */}
                <div className={styles.formGroup}>
                    <label htmlFor="email">Email</label>
                    <input id="email" type="email" {...register('email')} disabled={isSubmitting}/>
                    {errors.email && <p role="alert" className={styles.errorMessage}>{errors.email.message}</p>}
                </div>
                 {/* Mobile */}
                 <div className={styles.formGroup}>
                    <label htmlFor="mobile">Mobile</label>
                    <input id="mobile" type="tel" {...register('mobile')} disabled={isSubmitting}/>
                    {errors.mobile && <p role="alert" className={styles.errorMessage}>{errors.mobile.message}</p>}
                </div>
                 {/* School/Department */}
                <div className={styles.formGroup}>
                    <label htmlFor="schoolOrDepartment">School / Department</label>
                    <input id="schoolOrDepartment" {...register('schoolOrDepartment')} disabled={isSubmitting} />
                </div>
                {/* Position */}
                <div className={styles.formGroup}>
                    <label htmlFor="position">Position</label>
                    <input id="position" {...register('position')} disabled={isSubmitting} />
                </div>
                 {/* Arrival Date */}
                 <div className={styles.formGroup}>
                    <label htmlFor="arrivalDate">Arrival Date</label>
                    <input id="arrivalDate" type="date" {...register('arrivalDate')} disabled={isSubmitting}/>
                     {errors.arrivalDate && <p role="alert" className={styles.errorMessage}>{errors.arrivalDate.message}</p>}
                </div>
                 {/* Expected Departure Date */}
                <div className={styles.formGroup}>
                    <label htmlFor="expectedDepartureDate">Expected Departure</label>
                    <input id="expectedDepartureDate" type="date" {...register('expectedDepartureDate')} disabled={isSubmitting}/>
                     {errors.expectedDepartureDate && <p role="alert" className={styles.errorMessage}>{errors.expectedDepartureDate.message}</p>}
                 </div>


                 {/* --- Room Assignment --- */}
                <div className={`${styles.formGroup} ${styles.spanFull}`}> {/* Span full width */}
                    <hr className={styles.divider} />
                    <h3 className={styles.subheading}>Room Assignment</h3>
                 </div>

                 {/* Building Selection */}
                 <div className={styles.formGroup}>
                    <label htmlFor="buildingSelect">Building *</label>
                    {/* Use a temporary name for the building select that RHF can watch easily */}
                    <select
                        id="buildingSelect"
                        {...register('__buildingSelect')} // Register temporary field
                        disabled={isSubmitting}
                        defaultValue={selectedBuildingId} // Set initial value based on state
                    >
                        <option value="">-- Select Building --</option>
                        {buildings.map(building => (
                            <option key={building.id} value={building.id.toString()}>
                                Bldg {building.buildingNumber} ({building.buildingType})
                            </option>
                        ))}
                    </select>
                    {/* No direct error display needed for this helper select */}
                 </div>

                {/* Room Selection */}
                <div className={styles.formGroup}>
                    <label htmlFor="roomId">Room *</label>
                    {/* Use Controller for complex dependencies if needed, but register is fine here */}
                    <select
                        id="roomId"
                        {...register('roomId', { valueAsNumber: true })} // Register the actual field to submit, convert value to number
                        disabled={isSubmitting || !selectedBuildingId || availableRoomsForSelectedBuilding.length === 0} // Disable if no building selected or no rooms available
                        aria-invalid={errors.roomId ? "true" : "false"}
                    >
                        <option value="">
                            {!selectedBuildingId ? '-- Select Building First --' : '-- Select Room --'}
                         </option>
                        {availableRoomsForSelectedBuilding.map(room => (
                            <option key={room.id} value={room.id}>
                                Room {room.roomNumber} ({room.bedroomCount} Bed)
                            </option>
                        ))}
                        {selectedBuildingId && availableRoomsForSelectedBuilding.length === 0 && (
                             <option value="" disabled>-- No Available Rooms in Building --</option>
                        )}
                    </select>
                    {errors.roomId && <p role="alert" className={styles.errorMessage}>{errors.roomId.message}</p>}
                </div>
            </div>

            {/* Form Actions */}
            <div className={styles.formActions}>
                <button type="button" onClick={onCancel} className={styles.cancelButton} disabled={isSubmitting}>
                    Cancel
                </button>
                <button type="submit" className={styles.submitButton} disabled={isSubmitting}>
                    {isSubmitting ? 'Saving...' : (initialData ? 'Update Tenant' : 'Create Tenant & Check In')}
                </button>
            </div>
        </form>
    );
};

export default TenantForm;