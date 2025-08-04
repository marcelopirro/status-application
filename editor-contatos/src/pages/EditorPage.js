import React, { useState, useEffect } from 'react';
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
import BlocoSelector from '../components/BlocoSelector';
import ContatosList from '../components/ContatosList';
import StatusEditor from '../components/StatusEditor';

const EditorPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const theme = useTheme();
  const [bandeira, setBandeira] = useState(location.state?.bandeira || null);
  const [celular, setCelular] = useState(null);
  const [blocos, setBlocos] = useState([]);
  const [contatosSelecionados, setContatosSelecionados] = useState([]);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (!bandeira) {
      navigate('/');
    }
  }, [bandeira, navigate]);

  const handleCelularSelect = (value) => {
    setCelular(value);
    setBlocos([]);
    setContatosSelecionados([]);
  };

  const handleBlocosSelect = (selectedBlocos) => {
    setBlocos(selectedBlocos);
    setContatosSelecionados([]);
  };

  const handleContatosSelect = (selectedContatos) => {
    setContatosSelecionados(selectedContatos);
  };

  const handleUpdateSuccess = () => {
    // Forçar recarregamento dos contatos após atualização
    setRefreshKey(prevKey => prevKey + 1);
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
          
          <Box sx={{ marginBottom: '20px' }}>
            <BlocoSelector 
              bandeira={bandeira} 
              celular={celular} 
              onBlocosSelect={handleBlocosSelect} 
            />
          </Box>
          
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
          {celular && blocos.length > 0 && (
            <StatusEditor 
              bandeira={bandeira} 
              celular={celular} 
              contatosSelecionados={contatosSelecionados}
              onUpdateSuccess={handleUpdateSuccess}
            />
          )}
          
          <Box sx={{ marginTop: '20px' }}>
            <ContatosList 
              key={refreshKey}
              bandeira={bandeira} 
              celular={celular} 
              blocos={blocos} 
              onContatosSelect={handleContatosSelect} 
            />
          </Box>
        </Grid>
      </Grid>
    </Container>
  );
};

export default EditorPage;