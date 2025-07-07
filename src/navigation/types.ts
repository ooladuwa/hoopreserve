export type RootStackParamList = {
    Login: undefined;
    Signup: undefined;
    Home: undefined;
    Gyms: undefined;
    Courts: { gymId: string };
    'Book Court': { courtId: string };
    'My Bookings': undefined;
};

export type Gym = {
    id: string;
    name: string;
    address: string;
};

export type Booking = {
    id: string;
    start_time: string;
    end_time: string;
    court: {
        id: string;
        name: string;
        gym: {
            name: string;
        };
    };
};