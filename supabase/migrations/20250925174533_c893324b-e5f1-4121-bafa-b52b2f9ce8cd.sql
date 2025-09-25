-- Update the most recent user to admin role
UPDATE user_roles 
SET role = 'admin'::app_role 
WHERE user_id = (
  SELECT p.id 
  FROM profiles p 
  JOIN user_roles ur ON p.id = ur.user_id 
  WHERE p.email = 'vissermich+1@gmail.com'
);