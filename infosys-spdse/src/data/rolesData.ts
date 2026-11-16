import rolesJson from '../../data/roles.json';
import { RoleConfig } from '../types';

export const rolesData: RoleConfig[] = rolesJson.roles as RoleConfig[];
export const examDefaults = rolesJson.examDefaults;
