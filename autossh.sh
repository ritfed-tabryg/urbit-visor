autossh -v -N -M 10984 \
-o "PubkeyAuthentication=yes" \
-o "PasswordAuthentication=no" \
-i /Users/y/.ssh/mirtyl \
-f \
-R 3000:localhost:3000 \
-R 3001:localhost:3000 \
root@londinium \
sleep 31536000
# -R 3002:localhost:3000 \
# -R 3003:localhost:3000 \
# -R 3004:localhost:3000 \
# -R 3005:localhost:3000 \
# -R 3006:localhost:3000 \
# -R 3007:localhost:3000 \
# -R 3008:localhost:3000 \
# -R 3009:localhost:3000 \
# -R 3010:localhost:3000 \
