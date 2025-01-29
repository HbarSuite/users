/**
 * Test suite for UsersService.
 * @description
 * Contains unit tests for verifying the functionality of the UsersService.
 * Tests service instantiation and basic functionality.
 * @example
 * // Run the tests
 * npm run test users.service
 * @compodoc
 * @category Tests
 * @subcategory Users
 */

import { Test, TestingModule } from '@nestjs/testing'
import { UsersService } from './users.service'

describe('UsersService', () => {
  let service: UsersService;

  /**
   * Setup before each test.
   * @description
   * Creates a testing module and instantiates UsersService
   * for use in the test cases.
   */
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UsersService],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  /**
   * Test case to verify service instantiation.
   * @description
   * Ensures that the UsersService is properly defined
   * after module compilation.
   */
  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
