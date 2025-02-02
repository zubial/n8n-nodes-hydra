import { HydraAttempt } from './HydraAttempt';

export class HydraBruteForceResult {
	target: string | null = null;
	service: string | null = null;
	attemptCount: number = 0;
	cracked: boolean = false;
	duration: number | null = null;
	durationFormatted: string | null = null;
	allAttempts: HydraAttempt[] = [];
	successfulAttempts: HydraAttempt[] = [];
	errors: string[] = [];
}
