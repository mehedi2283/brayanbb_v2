# 1. Update UserSchema
sed -i 's/  locationId: { type: String } \/\/ Only required for clients/  locationId: { type: String }, \/\/ Only required for clients\n  tutorialCompleted: { type: Boolean, default: false }/' server.js

# 2. Update login endpoint to return tutorialCompleted
sed -i "s/user: { email: user.email, role: user.role, locationId: user.locationId }/user: { email: user.email, role: user.role, locationId: user.locationId, tutorialCompleted: user.tutorialCompleted }/" server.js

# 3. Update verify-token endpoint to return tutorialCompleted
sed -i "s/user: { email: user.email, role: user.role, locationId: user.locationId }/user: { email: user.email, role: user.role, locationId: user.locationId, tutorialCompleted: user.tutorialCompleted }/" server.js

