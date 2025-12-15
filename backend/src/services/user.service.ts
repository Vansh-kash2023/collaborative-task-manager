import { UserRepository } from '../repositories/user.repository';

export class UserService {
  private userRepository: UserRepository;

  constructor() {
    this.userRepository = new UserRepository();
  }

  async getAllUsers() {
    const users = await this.userRepository.findAll();
    // Don't return passwords
    return users.map(({ password: _password, ...user }) => user);
  }
}
