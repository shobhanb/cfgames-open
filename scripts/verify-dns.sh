#!/bin/bash

# Simple DNS verification helper
echo "To verify the DNS challenge:"
echo "1. Add a TXT record to your DNS settings:"
echo "   - Name: _acme-challenge"
echo "   - Value: [The value provided by certbot]"
echo ""
echo "2. Wait for DNS propagation (may take 5-30 minutes)"
echo ""
echo "3. Verify the TXT record:"
echo "   dig txt _acme-challenge.cfgames.site"
echo ""
echo "4. Once verified, press Enter in the certbot prompt"