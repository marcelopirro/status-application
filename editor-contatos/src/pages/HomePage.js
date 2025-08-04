import React, { useState } from 'react'; // Adicione esta linha
import { useNavigate } from 'react-router-dom';
import { 
  Container, 
  Typography, 
  Box, 
  Button, 
  Card, 
  CardContent,
  useTheme
} from '@mui/material';
import BandeiraSelector from '../components/BandeiraSelector';

const HomePage = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const [bandeira, setBandeira] = useState(null); // Agora useState está definido

  const handleBandeiraSelect = (value) => {
    setBandeira(value);
  };

  const handleNavigateToEditor = () => {
    if (bandeira) {
      navigate('/editor', { state: { bandeira } });
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Card elevation={3}>
        <CardContent>
          <Typography 
            variant="h4" 
            component="h1" 
            gutterBottom
            sx={{ 
              fontWeight: 'bold',
              color: theme.palette.primary.main,
              marginBottom: '30px'
            }}
          >
            Sistema de Gerenciamento de Contatos
          </Typography>
          
          <Typography 
            variant="subtitle1" 
            gutterBottom
            sx={{ marginBottom: '30px' }}
          >
            Selecione uma bandeira para começar a edição dos contatos
          </Typography>
          
          <Box sx={{ maxWidth: '500px', margin: '0 auto' }}>
            <BandeiraSelector onBandeiraSelect={handleBandeiraSelect} />
            
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
              <Button
                variant="contained"
                onClick={handleNavigateToEditor}
                disabled={!bandeira}
                size="large"
              >
                Avançar para Edição
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
};

export default HomePage;