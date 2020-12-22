import bcrypt from 'bcrypt'
import { User } from '@/models'
import { UserAction } from '@/types'

export const canUserPerform = (user: User, action: UserAction): boolean => {
  return user.actions ? user.actions.indexOf(action) >= 0 : false
}

export const isUserPasswordValid = async (user: User, password: string): Promise<boolean> => {
  return user.password ? await bcrypt.compare(password, user.password) : false
}
