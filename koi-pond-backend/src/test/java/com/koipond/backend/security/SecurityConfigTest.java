package com.koipond.backend.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.koipond.backend.dto.DesignDTO;
import com.koipond.backend.model.User;
import com.koipond.backend.repository.UserRepository;
import com.koipond.backend.service.ConsultationRequestService;
import com.koipond.backend.service.DesignService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Collections;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class SecurityConfigTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private UserRepository userRepository;

    @MockBean
    private ConsultationRequestService consultationRequestService;

    @MockBean
    private DesignService designService;

    @BeforeEach
    void setUp() {
        User mockUser = new User();
        mockUser.setUsername("user");
        when(userRepository.findByUsername(anyString())).thenReturn(Optional.of(mockUser));
        
        when(consultationRequestService.getConsultationRequests(any())).thenReturn(Collections.emptyList());
        
        DesignDTO mockDesignDTO = new DesignDTO();
        mockDesignDTO.setId("1");
        mockDesignDTO.setStatus("APPROVED");
        when(designService.approveDesign(anyString())).thenReturn(mockDesignDTO);
    }

    @Test
    @WithMockUser(authorities = "ROLE_3")
    void designEndpoints_WithRole3_ShouldBeAccessible() throws Exception {
        mockMvc.perform(post("/api/pond-designs")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"name\":\"Test Design\",\"description\":\"Test Description\"}"))
                .andExpect(status().isOk());
        mockMvc.perform(get("/api/pond-designs/designer")).andExpect(status().isOk());
        mockMvc.perform(put("/api/pond-designs/1")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"name\":\"Updated Design\",\"description\":\"Updated Description\"}"))
                .andExpect(status().isOk());
        mockMvc.perform(delete("/api/pond-designs/1")).andExpect(status().isNoContent());
    }

    @Test
    @WithMockUser(authorities = "ROLE_4")
    void unauthorizedAccess_ShouldBeDenied() throws Exception {
        mockMvc.perform(post("/api/projects")).andExpect(status().isForbidden());
        mockMvc.perform(get("/api/manager")).andExpect(status().isForbidden());
        mockMvc.perform(post("/api/pond-designs")).andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(authorities = "ROLE_1")
    void managerEndpoints_WithRole1_ShouldBeAccessible() throws Exception {
        mockMvc.perform(get("/api/projects")).andExpect(status().isOk());
        mockMvc.perform(get("/api/pond-designs/pending")).andExpect(status().isOk());
        mockMvc.perform(patch("/api/pond-designs/1/approve")).andExpect(status().isOk());
        mockMvc.perform(patch("/api/pond-designs/1/reject")).andExpect(status().isOk());
    }
}