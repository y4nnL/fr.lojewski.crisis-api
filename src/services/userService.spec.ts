import bcrypt from 'bcrypt'
import { canUserPerform, isUserPasswordValid } from '@/services/userService'
import { UserAction } from '@/types'

describe('user service', () => {
  
  describe('::canUserPerform', () => {
    
    it('should return false', () => {
      let user: any = {}
      expect(canUserPerform(user, UserAction.MonitoringPing)).toStrictEqual(false)
      user.actions = []
      expect(canUserPerform(user, UserAction.MonitoringPing)).toStrictEqual(false)
      user.actions = [ UserAction.TokenAuthorizationCreate ]
      expect(canUserPerform(user, UserAction.MonitoringPing)).toStrictEqual(false)
    })
    
    it('should return true', () => {
      let user: any = { actions: [ UserAction.MonitoringPing ] }
      expect(canUserPerform(user, UserAction.MonitoringPing)).toStrictEqual(true)
      user.actions = [
        UserAction.MonitoringPing,
        UserAction.TokenAuthorizationCreate,
        UserAction.TokenAuthorizationDelete,
      ]
      expect(canUserPerform(user, UserAction.MonitoringPing)).toStrictEqual(true)
    })
    
  })
  
  describe('::isUserPasswordValid', () => {
  
    it('should return false', async () => {
      let user: any = {}
      expect(await isUserPasswordValid(user, 'password')).toStrictEqual(false)
      user.password = ''
      expect(await isUserPasswordValid(user, 'password')).toStrictEqual(false)
      user.password = 'password'
      expect(await isUserPasswordValid(user, 'password')).toStrictEqual(false)
    })
  
    it('should return true', async () => {
      const user: any = { password: await bcrypt.hash('password', 10) }
      expect(await isUserPasswordValid(user, 'password')).toStrictEqual(true)
    })
    
  })
  
})



