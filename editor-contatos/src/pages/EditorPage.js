import React, { useState, useEffect } from 'react'; // Adicionei o useEffect aqui
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Button,
  Breadcrumbs,
  Link,
  Grid,
  useTheme
} from '@mui/material';
import CelularSelector from '../components/CelularSelector';
import NumeroSelector from '../components/NumeroSelector';
import StatusEditor from '../components/StatusEditor';

const EditorPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const theme = useTheme();
  const [bandeira, setBandeira] = useState(location.state?.bandeira || null);
  const [celular, setCelular] = useState(null);
  const [contatosSelecionados, setContatosSelecionados] = useState([]);

  useEffect(() => {
    if (!bandeira) {
      navigate('/');
    }
  }, [bandeira, navigate]);

  const handleCelularSelect = (value) => {
    setCelular(value);
    setContatosSelecionados([]);
  };

  const handleUpdateSuccess = () => {
    setContatosSelecionados([]);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ marginBottom: '20px' }}>
        <Breadcrumbs aria-label="breadcrumb">
          <Link 
            color="inherit" 
            onClick={() => navigate('/')}
            sx={{ cursor: 'pointer' }}
          >
            Início
          </Link>
          <Typography color="text.primary">Editor</Typography>
        </Breadcrumbs>
      </Box>
      
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
        Editor de Contatos - Bandeira: {bandeira}
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Box sx={{ marginBottom: '20px' }}>
            <CelularSelector 
              bandeira={bandeira} 
              onCelularSelect={handleCelularSelect} 
            />
          </Box>
          
          {celular && (
            <Box sx={{ marginBottom: '20px' }}>
              <NumeroSelector 
                bandeira={bandeira}
                celular={celular}
                onNumerosSelecionados={setContatosSelecionados}
              />
            </Box>
          )}
          
          <Box>
            <Button 
              variant="outlined" 
              onClick={() => navigate('/')}
              fullWidth
              size="large"
            >
              Voltar para Seleção
            </Button>
          </Box>
        </Grid>
        
        <Grid item xs={12} md={8}>
          {celular && contatosSelecionados.length > 0 && (
            <StatusEditor 
              bandeira={bandeira} 
              celular={celular} 
              contatosSelecionados={contatosSelecionados}
              onUpdateSuccess={handleUpdateSuccess}
            />
          )}
        </Grid>
      </Grid>
    </Container>
  );
};

export default EditorPage;