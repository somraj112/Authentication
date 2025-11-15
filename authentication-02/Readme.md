Session based Authentication 

Problems:
1. In every request we are making a database call, which is not a good practice.
2. It adds a latency.
3. Since it's a database operation. In reality the database will run on a different server.
4. Which will be expensive.

Advantages:
1. But it is more Secure.
2. So in Banking system where the security is important, they use this session Based Authentication.
3. You can invoke revoke the session easily.