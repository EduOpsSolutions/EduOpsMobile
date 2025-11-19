import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  ScrollView,
  TextInput,
  StyleSheet,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

interface Option {
  value: string;
  label: string;
  disabled?: boolean;
  price?: number;
  helperText?: string;
  corequisites?: string[];
}

interface MultiSelectFieldProps {
  label: string;
  value: string[];
  onChange: (value: string[]) => void;
  options: Option[];
  placeholder?: string;
  searchPlaceholder?: string;
  disabled?: boolean;
  required?: boolean;
  error?: string;
}

const MultiSelectField: React.FC<MultiSelectFieldProps> = ({
  label,
  value = [],
  onChange,
  options = [],
  placeholder = 'Select options...',
  searchPlaceholder = 'Search...',
  disabled = false,
  required = false,
  error,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const handleToggle = (optionValue: string) => {
    if (disabled) return;

    let newValue: string[];
    const option = options.find((opt) => opt.value === optionValue);

    if (!option || option.disabled) return;

    if (value.includes(optionValue)) {
      // Removing a course - also remove its co-requisites
      newValue = value.filter((v) => v !== optionValue);

      // Remove all co-requisites of this course
      if (option.corequisites && option.corequisites.length > 0) {
        option.corequisites.forEach((coreqId) => {
          newValue = newValue.filter((v) => v !== coreqId);
        });
      }

      // Also remove courses that list THIS course as their co-requisite (bidirectional)
      options.forEach((opt) => {
        if (opt.corequisites && opt.corequisites.includes(optionValue)) {
          newValue = newValue.filter((v) => v !== opt.value);
        }
      });
    } else {
      // Adding a course - also add its co-requisites
      newValue = [...value, optionValue];

      // Check if this course has co-requisites and auto-add them
      if (option.corequisites && option.corequisites.length > 0) {
        // Add all co-requisites that aren't already selected and aren't disabled
        option.corequisites.forEach((coreqId) => {
          if (!newValue.includes(coreqId)) {
            // Check if the co-requisite course is disabled
            const coreqOption = options.find((opt) => opt.value === coreqId);
            if (!coreqOption?.disabled) {
              newValue.push(coreqId);
            }
          }
        });
      }

      // Also check if any OTHER courses list THIS course as a co-requisite (bidirectional)
      options.forEach((opt) => {
        if (opt.corequisites && opt.corequisites.includes(optionValue)) {
          // This option has the selected course as its co-requisite
          if (!newValue.includes(opt.value) && !opt.disabled) {
            newValue.push(opt.value);
          }
        }
      });
    }

    onChange(newValue);
  };

  const handleRemove = (optionValue: string, e: any) => {
    e.stopPropagation();
    if (disabled) return;

    // Same logic as handleToggle when removing - remove co-requisites too
    let newValue = value.filter((v) => v !== optionValue);

    const selectedOption = options.find((opt) => opt.value === optionValue);

    // Remove all co-requisites of this course
    if (selectedOption?.corequisites && selectedOption.corequisites.length > 0) {
      selectedOption.corequisites.forEach((coreqId) => {
        newValue = newValue.filter((v) => v !== coreqId);
      });
    }

    // Also remove courses that list THIS course as their co-requisite (bidirectional)
    options.forEach((opt) => {
      if (opt.corequisites && opt.corequisites.includes(optionValue)) {
        newValue = newValue.filter((v) => v !== opt.value);
      }
    });

    onChange(newValue);
  };

  const filteredOptions = options.filter((option) =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedOptions = options.filter((option) =>
    value.includes(option.value)
  );

  return (
    <View style={styles.container}>
      {label && (
        <Text style={styles.label}>
          {label}
          {required && <Text style={styles.required}> *</Text>}
        </Text>
      )}

      {/* Selected Items Display */}
      <TouchableOpacity
        style={[
          styles.fieldContainer,
          disabled && styles.fieldDisabled,
          error && styles.fieldError,
        ]}
        onPress={() => !disabled && setIsOpen(true)}
        disabled={disabled}
      >
        {selectedOptions.length > 0 ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chipsContainer}
          >
            {selectedOptions.map((option) => (
              <View
                key={option.value}
                style={[
                  styles.chip,
                  option.disabled && styles.chipDisabled,
                ]}
              >
                <Text
                  style={[
                    styles.chipText,
                    option.disabled && styles.chipTextDisabled,
                  ]}
                  numberOfLines={1}
                >
                  {option.label}
                </Text>
                {!disabled && !option.disabled && (
                  <TouchableOpacity
                    onPress={(e) => handleRemove(option.value, e)}
                    style={styles.chipRemove}
                  >
                    <Icon name="close" size={16} color="#fff" />
                  </TouchableOpacity>
                )}
              </View>
            ))}
          </ScrollView>
        ) : (
          <Text style={styles.placeholder}>{placeholder}</Text>
        )}
        <Icon
          name="keyboard-arrow-down"
          size={20}
          color="#666"
          style={styles.dropdownIcon}
        />
      </TouchableOpacity>

      {error && <Text style={styles.errorText}>{error}</Text>}

      {/* Dropdown Modal */}
      <Modal
        visible={isOpen}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsOpen(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setIsOpen(false)}
        >
          <View
            style={styles.modalContent}
            onStartShouldSetResponder={() => true}
          >
            <Text style={styles.modalTitle}>{label}</Text>

            {/* Search Input */}
            <View style={styles.searchContainer}>
              <Icon name="search" size={20} color="#666" style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder={searchPlaceholder}
                placeholderTextColor="#999"
                value={searchTerm}
                onChangeText={setSearchTerm}
                autoFocus
              />
            </View>

            {/* Options List */}
            <ScrollView style={styles.optionsList}>
              {filteredOptions.length > 0 ? (
                filteredOptions.map((option) => {
                  const isSelected = value.includes(option.value);
                  const isDisabled = option.disabled;

                  return (
                    <TouchableOpacity
                      key={option.value}
                      style={[
                        styles.optionItem,
                        isSelected && styles.optionItemSelected,
                        isDisabled && styles.optionItemDisabled,
                      ]}
                      onPress={() => !isDisabled && handleToggle(option.value)}
                      disabled={isDisabled}
                    >
                      <View style={styles.checkboxContainer}>
                        <View
                          style={[
                            styles.checkbox,
                            isSelected && styles.checkboxChecked,
                            isDisabled && styles.checkboxDisabled,
                          ]}
                        >
                          {isSelected && (
                            <Icon name="check" size={16} color="#fff" />
                          )}
                        </View>
                      </View>
                      <View style={styles.optionContent}>
                        <Text
                          style={[
                            styles.optionLabel,
                            isDisabled && styles.optionLabelDisabled,
                          ]}
                        >
                          {option.label}
                        </Text>
                        {option.price !== undefined && (
                          <Text style={styles.optionPrice}>
                            Price: ₱{parseFloat(option.price.toString()).toLocaleString()}
                          </Text>
                        )}
                        {option.helperText && (
                          <Text style={styles.optionHelper}>
                            {option.helperText}
                          </Text>
                        )}
                      </View>
                    </TouchableOpacity>
                  );
                })
              ) : (
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>No options found</Text>
                </View>
              )}
            </ScrollView>

            {/* Close Button */}
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setIsOpen(false)}
            >
              <Text style={styles.closeButtonText}>Done</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
  },
  required: {
    color: '#de0000',
  },
  fieldContainer: {
    minHeight: 50,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
  },
  fieldDisabled: {
    backgroundColor: '#f3f4f6',
    borderColor: '#d1d5db',
  },
  fieldError: {
    borderColor: '#de0000',
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    flex: 1,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#de0000',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginRight: 6,
    marginBottom: 4,
  },
  chipDisabled: {
    backgroundColor: '#9ca3af',
  },
  chipText: {
    color: '#fff',
    fontSize: 13,
    maxWidth: 150,
  },
  chipTextDisabled: {
    color: '#e5e7eb',
  },
  chipRemove: {
    marginLeft: 6,
    padding: 2,
  },
  placeholder: {
    color: '#9ca3af',
    fontSize: 14,
    flex: 1,
  },
  dropdownIcon: {
    marginLeft: 8,
  },
  errorText: {
    color: '#de0000',
    fontSize: 12,
    marginTop: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 16,
    backgroundColor: '#f9fafb',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 44,
    fontSize: 14,
    color: '#333',
  },
  optionsList: {
    maxHeight: 400,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 4,
  },
  optionItemSelected: {
    backgroundColor: '#fee2e2',
  },
  optionItemDisabled: {
    backgroundColor: '#f9fafb',
    opacity: 0.6,
  },
  checkboxContainer: {
    marginRight: 12,
    marginTop: 2,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: '#d1d5db',
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  checkboxChecked: {
    backgroundColor: '#de0000',
    borderColor: '#de0000',
  },
  checkboxDisabled: {
    backgroundColor: '#e5e7eb',
    borderColor: '#9ca3af',
  },
  optionContent: {
    flex: 1,
  },
  optionLabel: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  optionLabelDisabled: {
    color: '#6b7280',
  },
  optionPrice: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  optionHelper: {
    fontSize: 12,
    color: '#6b7280',
    fontStyle: 'italic',
    marginTop: 4,
  },
  emptyContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#9ca3af',
  },
  closeButton: {
    backgroundColor: '#de0000',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 16,
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default MultiSelectField;
